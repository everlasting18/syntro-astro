import PocketBase, { ClientResponseError } from "pocketbase";

const pocketbaseUrl = import.meta.env.PUBLIC_POCKETBASE_URL;

export const isPocketBaseConfigured = Boolean(pocketbaseUrl);

export const pb = new PocketBase(pocketbaseUrl);

export function isUniqueViolation(error: unknown, field: string) {
  return (
    error instanceof ClientResponseError &&
    error.response?.data?.[field]?.code === "validation_not_unique"
  );
}
