import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

// ============================================
// Admin Shipping Settings API
// GET: Retrieve all shipping/general settings
// PUT: Update shipping/general settings
// POST: Test Shippo connection, create shipping label
// ============================================

// GET - Retrieve settings
export async function GET(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "shipping";

    // Filter by key prefix based on type
    let items;
    if (type === "general") {
      items = await prisma.shippingSetting.findMany({
        where: {
          key: {
            in: [
              "business_name",
              "business_tagline",
              "stripe_public_key",
              "stripe_secret_key",
              "tax_rate",
              "tax_label",
              "email_notifications_orders",
              "email_notifications_inquiries",
              "email_notification_address",
              "maintenance_mode",
            ],
          },
        },
        orderBy: { key: "asc" },
      });
    } else {
      items = await prisma.shippingSetting.findMany({
        where: {
          NOT: {
            key: {
              in: [
                "business_name",
                "business_tagline",
                "stripe_public_key",
                "stripe_secret_key",
                "tax_rate",
                "tax_label",
                "email_notifications_orders",
                "email_notifications_inquiries",
                "email_notification_address",
                "maintenance_mode",
              ],
            },
          },
        },
        orderBy: { key: "asc" },
      });
    }

    return Response.json({ items });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return Response.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Upsert each setting
    const results = await Promise.all(
      items.map(async (item: { key: string; value: string }) => {
        if (!item.key) return null;

        return prisma.shippingSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        });
      })
    );

    const saved = results.filter(Boolean);

    return Response.json({
      success: true,
      count: saved.length,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return Response.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}

// POST - Test Shippo connection or create shipping label
export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (!authResult.authorized) return authResult.response;

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "testConnection") {
      const { apiKey } = body;

      if (!apiKey) {
        return Response.json(
          { error: "API key is required" },
          { status: 400 }
        );
      }

      // Test Shippo connection by making an address validation request
      try {
        const response = await fetch(
          "https://api.goshippo.com/addresses/",
          {
            method: "POST",
            headers: {
              Authorization: `ShippoToken ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "Test",
              street1: "215 Clayton St",
              city: "San Francisco",
              state: "CA",
              zip: "94117",
              country: "US",
              validate: true,
            }),
          }
        );

        if (response.ok) {
          return Response.json({
            success: true,
            message: "Shippo connection successful! API key is valid.",
          });
        } else {
          const errorData = await response.json();
          return Response.json(
            {
              error: "Connection failed",
              message:
                errorData.detail ||
                "Invalid API key or connection error",
            },
            { status: 400 }
          );
        }
      } catch (fetchError) {
        console.error("Shippo connection test error:", fetchError);
        return Response.json(
          {
            error: "Connection failed",
            message: "Could not connect to Shippo API",
          },
          { status: 500 }
        );
      }
    }

    if (action === "createLabel") {
      const { orderId } = body;

      if (!orderId) {
        return Response.json(
          { error: "Order ID is required" },
          { status: 400 }
        );
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return Response.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Get Shippo API key from settings
      const apiKeySetting = await prisma.shippingSetting.findUnique({
        where: { key: "shippo_api_key" },
      });

      const shippoKey = apiKeySetting?.value;
      if (!shippoKey) {
        return Response.json(
          { error: "Shippo API key not configured. Go to Shipping Settings to add it." },
          { status: 400 }
        );
      }

      // Get return address from settings
      const returnSettings = await prisma.shippingSetting.findMany({
        where: {
          key: {
            startsWith: "return_",
          },
        },
      });

      const returnAddress: Record<string, string> = {};
      returnSettings.forEach((s) => {
        returnAddress[s.key.replace("return_", "")] = s.value;
      });

      // Parse shipping address from order
      const shippingAddr = order.shippingAddress as unknown as {
        name: string;
        street1: string;
        street2?: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone?: string;
      };

      // Get default parcel dimensions
      const parcelSettings = await prisma.shippingSetting.findMany({
        where: {
          key: {
            startsWith: "default_parcel_",
          },
        },
      });

      const parcel: Record<string, string> = {
        length: "10",
        width: "8",
        height: "4",
        weight: "16",
      };
      parcelSettings.forEach((s) => {
        const dim = s.key.replace("default_parcel_", "");
        parcel[dim] = s.value;
      });

      try {
        // Create shipment in Shippo
        const shipmentResponse = await fetch(
          "https://api.goshippo.com/shipments/",
          {
            method: "POST",
            headers: {
              Authorization: `ShippoToken ${shippoKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address_from: {
                name: returnAddress.name || "423D Built",
                street1: returnAddress.street1 || "",
                street2: returnAddress.street2 || "",
                city: returnAddress.city || "Bristol",
                state: returnAddress.state || "TN",
                zip: returnAddress.zip || "37620",
                country: returnAddress.country || "US",
                phone: returnAddress.phone || "",
              },
              address_to: {
                name: shippingAddr.name,
                street1: shippingAddr.street1,
                street2: shippingAddr.street2 || "",
                city: shippingAddr.city,
                state: shippingAddr.state,
                zip: shippingAddr.zip,
                country: shippingAddr.country || "US",
                phone: shippingAddr.phone || "",
              },
              parcels: [
                {
                  length: parcel.length,
                  width: parcel.width,
                  height: parcel.height,
                  distance_unit: "in",
                  weight: parcel.weight,
                  mass_unit: "oz",
                },
              ],
              async: false,
            }),
          }
        );

        if (!shipmentResponse.ok) {
          const errorData = await shipmentResponse.json();
          throw new Error(
            errorData.detail || "Failed to create shipment in Shippo"
          );
        }

        const shipment = await shipmentResponse.json();

        // Get the cheapest rate
        const rates = shipment.rates || [];
        if (rates.length === 0) {
          return Response.json(
            { error: "No shipping rates available for this destination" },
            { status: 400 }
          );
        }

        // Sort by amount and pick cheapest
        rates.sort(
          (a: { amount: string }, b: { amount: string }) =>
            parseFloat(a.amount) - parseFloat(b.amount)
        );

        const selectedRate = rates[0];

        // Create transaction (purchase label)
        const transactionResponse = await fetch(
          "https://api.goshippo.com/transactions/",
          {
            method: "POST",
            headers: {
              Authorization: `ShippoToken ${shippoKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rate: selectedRate.object_id,
              label_file_type: "PDF",
              async: false,
            }),
          }
        );

        if (!transactionResponse.ok) {
          const errorData = await transactionResponse.json();
          throw new Error(
            errorData.detail || "Failed to purchase shipping label"
          );
        }

        const transaction = await transactionResponse.json();

        if (transaction.status !== "SUCCESS") {
          throw new Error(
            transaction.messages?.[0]?.text ||
              "Label purchase was not successful"
          );
        }

        // Update order with tracking info
        await prisma.order.update({
          where: { id: orderId },
          data: {
            trackingNumber: transaction.tracking_number || null,
            trackingCarrier: selectedRate.provider || null,
            shippoTransactionId: transaction.object_id || null,
            labelUrl: transaction.label_url || null,
            status: "SHIPPED",
          },
        });

        return Response.json({
          success: true,
          trackingNumber: transaction.tracking_number,
          carrier: selectedRate.provider,
          labelUrl: transaction.label_url,
          transactionId: transaction.object_id,
        });
      } catch (shippoError) {
        console.error("Shippo label creation error:", shippoError);
        return Response.json(
          {
            error:
              shippoError instanceof Error
                ? shippoError.message
                : "Failed to create shipping label",
          },
          { status: 500 }
        );
      }
    }

    return Response.json(
      { error: "Invalid action. Use: testConnection or createLabel" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in shipping POST:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
