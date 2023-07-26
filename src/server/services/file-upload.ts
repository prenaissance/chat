import {
  type BlockBlobParallelUploadOptions,
  type BlobServiceClient,
  type ContainerClient,
} from "@azure/storage-blob";

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
  await newContainerClient.createIfNotExists();
  containerMap.set(containerName, newContainerClient);
  return newContainerClient;
};

export const uploadFile = async (
  blobServiceClient: BlobServiceClient,
  {
    containerName,
    fileName,
    fileBuffer,
  }: {
    containerName: string;
    fileName: string;
    fileBuffer: Buffer | ArrayBuffer;
  },
  options?: BlockBlobParallelUploadOptions
) => {
  const containerClient = await getContainer(blobServiceClient, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  return await blockBlobClient.uploadData(fileBuffer, options);
};

export const deleteFile = async (
  blobServiceClient: BlobServiceClient,
  {
    containerName,
    fileName,
  }: {
    containerName: string;
    fileName: string;
  }
) => {
  const containerClient = await getContainer(blobServiceClient, containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  return await blockBlobClient.deleteIfExists();
};
