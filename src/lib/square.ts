import { SquareClient, SquareEnvironment } from "square";

let _squareClient: SquareClient | null = null;

/**
 * Returns a lazy-initialised Square API client (singleton).
 * Reads SQUARE_ACCESS_TOKEN and SQUARE_ENVIRONMENT from env vars.
 */
export function getSquareClient(): SquareClient {
  if (!_squareClient) {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) {
      throw new Error(
        "SQUARE_ACCESS_TOKEN is not set. Add it to your .env.local file."
      );
    }

    const envName = (process.env.SQUARE_ENVIRONMENT ?? "sandbox").toLowerCase();
    const environment =
      envName === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox;

    _squareClient = new SquareClient({
      token,
      environment,
    });
  }
  return _squareClient;
}

/**
 * Returns the Square location ID from env vars.
 * Almost every Square API call requires a location ID.
 */
export function getSquareLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    throw new Error(
      "SQUARE_LOCATION_ID is not set. Add it to your .env.local file."
    );
  }
  return locationId;
}
