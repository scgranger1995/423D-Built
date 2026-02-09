import { NextRequest, NextResponse } from "next/server";

// ============================================
// Shipping Rate Calculation
// ============================================

interface ShippingAddress {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ParcelDetails {
  length: number; // inches
  width: number; // inches
  height: number; // inches
  weight: number; // ounces
}

interface ShippoRate {
  object_id: string;
  provider: string;
  servicelevel: {
    name: string;
    token: string;
  };
  estimated_days: number;
  amount: string;
  currency: string;
}

interface ShippoShipmentResponse {
  rates: ShippoRate[];
  status: string;
  messages?: Array<{ text: string }>;
}

interface FormattedRate {
  id: string;
  provider: string;
  serviceName: string;
  serviceLevel: string;
  estimatedDays: number;
  amount: number; // in cents
  currency: string;
  shippoRateId: string;
}

// ============================================
// Flat-rate fallback shipping options
// ============================================

const FLAT_RATE_OPTIONS: FormattedRate[] = [
  {
    id: "flat-standard",
    provider: "USPS",
    serviceName: "Standard Shipping",
    serviceLevel: "standard",
    estimatedDays: 7,
    amount: 799,
    currency: "USD",
    shippoRateId: "flat-standard",
  },
  {
    id: "flat-priority",
    provider: "USPS",
    serviceName: "Priority Mail",
    serviceLevel: "priority",
    estimatedDays: 3,
    amount: 1499,
    currency: "USD",
    shippoRateId: "flat-priority",
  },
  {
    id: "flat-express",
    provider: "USPS",
    serviceName: "Priority Mail Express",
    serviceLevel: "express",
    estimatedDays: 1,
    amount: 2999,
    currency: "USD",
    shippoRateId: "flat-express",
  },
];

// 423D Built's origin address (Bristol, TN)
const FROM_ADDRESS = {
  name: "423D Built",
  street1: process.env.SHIP_FROM_STREET || "123 State Street",
  city: process.env.SHIP_FROM_CITY || "Bristol",
  state: process.env.SHIP_FROM_STATE || "TN",
  zip: process.env.SHIP_FROM_ZIP || "37620",
  country: "US",
};

/**
 * Fetch shipping rates from the Shippo API.
 */
async function getShippoRates(
  toAddress: ShippingAddress,
  parcel: ParcelDetails
): Promise<FormattedRate[]> {
  const shippoApiKey = process.env.SHIPPO_API_TOKEN;

  if (!shippoApiKey) {
    console.warn("SHIPPO_API_TOKEN not configured, using flat-rate fallback");
    return FLAT_RATE_OPTIONS;
  }

  try {
    // Create shipment with Shippo to get rates
    const response = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${shippoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: FROM_ADDRESS,
        address_to: {
          name: toAddress.name || "Customer",
          street1: toAddress.street1,
          street2: toAddress.street2 || "",
          city: toAddress.city,
          state: toAddress.state,
          zip: toAddress.zip,
          country: toAddress.country || "US",
        },
        parcels: [
          {
            length: parcel.length.toString(),
            width: parcel.width.toString(),
            height: parcel.height.toString(),
            distance_unit: "in",
            weight: parcel.weight.toString(),
            mass_unit: "oz",
          },
        ],
        async: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shippo API error (${response.status}):`, errorText);
      return FLAT_RATE_OPTIONS;
    }

    const data = (await response.json()) as ShippoShipmentResponse;

    if (!data.rates || data.rates.length === 0) {
      console.warn("No rates returned from Shippo, using flat-rate fallback");
      return FLAT_RATE_OPTIONS;
    }

    // Format and sort rates by price
    const formattedRates: FormattedRate[] = data.rates
      .map((rate) => ({
        id: rate.object_id,
        provider: rate.provider,
        serviceName: rate.servicelevel.name,
        serviceLevel: rate.servicelevel.token,
        estimatedDays: rate.estimated_days || 7,
        amount: Math.round(parseFloat(rate.amount) * 100), // Convert dollars to cents
        currency: rate.currency.toUpperCase(),
        shippoRateId: rate.object_id,
      }))
      .sort((a, b) => a.amount - b.amount);

    return formattedRates;
  } catch (error) {
    console.error("Shippo API call failed:", error);
    return FLAT_RATE_OPTIONS;
  }
}

/**
 * POST /api/shipping/rates
 * Calculate shipping rates based on destination address and parcel details.
 * Falls back to flat-rate shipping if Shippo is unavailable.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, parcel } = body as {
      address: ShippingAddress;
      parcel?: ParcelDetails;
    };

    // ---- Validate address ----
    if (!address) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required" },
        { status: 400 }
      );
    }

    if (!address.street1 || !address.city || !address.state || !address.zip) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Incomplete address. Street, city, state, and zip code are required.",
        },
        { status: 400 }
      );
    }

    // US only shipping
    if (address.country && address.country !== "US") {
      return NextResponse.json(
        {
          success: false,
          error: "We currently only ship within the United States.",
        },
        { status: 400 }
      );
    }

    // Default parcel dimensions if not provided
    const parcelDetails: ParcelDetails = parcel || {
      length: 10,
      width: 8,
      height: 4,
      weight: 16, // 1 lb default
    };

    // Validate parcel dimensions
    if (
      parcelDetails.length <= 0 ||
      parcelDetails.width <= 0 ||
      parcelDetails.height <= 0 ||
      parcelDetails.weight <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Parcel dimensions and weight must be positive numbers.",
        },
        { status: 400 }
      );
    }

    // Get shipping rates
    const rates = await getShippoRates(
      { ...address, country: address.country || "US" },
      parcelDetails
    );

    return NextResponse.json({
      success: true,
      data: {
        rates,
        fromAddress: {
          city: FROM_ADDRESS.city,
          state: FROM_ADDRESS.state,
          country: FROM_ADDRESS.country,
        },
        toAddress: {
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country || "US",
        },
      },
    });
  } catch (error) {
    console.error("Shipping rate calculation failed:", error);

    // Return flat-rate fallback on any error
    return NextResponse.json({
      success: true,
      data: {
        rates: FLAT_RATE_OPTIONS,
        fallback: true,
        message: "Live rates unavailable. Showing flat-rate options.",
      },
    });
  }
}
