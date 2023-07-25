import { BlobServiceClient } from "@azure/storage-blob";
import { env } from "~/env.mjs";

const globalForBlobStorage = globalThis as unknown as {
  blobServiceClient: BlobServiceClient | undefined;
};

export const blobServiceClient =
  globalForBlobStorage.blobServiceClient ??
  new BlobServiceClient(env.AZURE_STORAGE_CONNECTION_STRING);

if (env.NODE_ENV !== "production")
  globalForBlobStorage.blobServiceClient = blobServiceClient;
