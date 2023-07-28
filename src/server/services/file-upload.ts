import {
  type BlockBlobParallelUploadOptions,
  type BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob";

type FileDestination = {
  containerName: string;
  fileName: string;
};

const containerMap = new Map<string, ContainerClient>();

const getContainer = async (
  blobServiceClient: BlobServiceClient,
  containerName: string
) => {
  const containerClient = containerMap.get(containerName);
  if (containerClient) {
    return containerClient;
  }

  const newContainerClient =
    blobServiceClient.getContainerClient(containerName);
  await newContainerClient.createIfNotExists({
    access: "blob",
  });
  containerMap.set(containerName, newContainerClient);
  return newContainerClient;
};

export const uploadFile = async (
  blobServiceClient: BlobServiceClient,
  {
    containerName,
    fileName,
    fileBuffer,
  }: FileDestination & {
    fileBuffer: Buffer | ArrayBuffer;
  },
  options?: BlockBlobParallelUploadOptions
) => {
  const containerClient = await getContainer(blobServiceClient, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  return {
    blockBlobClient,
    response: await blockBlobClient.uploadData(fileBuffer, options),
  };
};

export const downloadAndUploadFile = async (
  blobServiceClient: BlobServiceClient,
  downloadUrl: string,
  { containerName, fileName }: FileDestination,
  options?: BlockBlobParallelUploadOptions
) => {
  const downloadRequest = await fetch(downloadUrl);
  return uploadFile(
    blobServiceClient,
    {
      containerName,
      fileName,
      fileBuffer: await downloadRequest.arrayBuffer(),
    },
    {
      ...options,
      blobHTTPHeaders: {
        blobContentType:
          downloadRequest.headers.get("content-type") ??
          options?.blobHTTPHeaders?.blobContentType,
      },
    }
  );
};

export const deleteFile = async (
  blobServiceClient: BlobServiceClient,
  { containerName, fileName }: FileDestination
) => {
  const containerClient = await getContainer(blobServiceClient, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  return { blockBlobClient, response: await blockBlobClient.deleteIfExists() };
};

export const fileExists = async (
  blobServiceClient: BlobServiceClient,
  { containerName, fileName }: FileDestination
) => {
  const containerClient = await getContainer(blobServiceClient, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  return await blockBlobClient.exists();
};
