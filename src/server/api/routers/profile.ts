import sharp from "sharp";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { deleteFile, uploadFile } from "~/server/services/file-upload";
import { urlEncodedToBuffer } from "~/server/services/encoding";
import { editProfileSchema } from "~/shared/schemas/profile-schema";

const getResizedAvatarBuffer = (buffer: Buffer | ArrayBuffer) =>
  sharp(buffer)
    .metadata()
    .then(({ width, height }) => {
      if (!width || !height) {
        throw new Error("Could not read image size metadata");
      }

      const size = Math.min(width, height, 256);
      return sharp(buffer).resize(size, size, {
        fit: "cover",
      });
    })
    .then((sharp) => sharp.toBuffer());

export const profileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { prisma, session } = ctx;
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
    });

    return {
      ...user,
      isOnline: true,
    };
  }),

  updateProfile: protectedProcedure
    .input(editProfileSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, image, description } = input;
      const { prisma, session, blobServiceClient } = ctx;
      const getImageUrl = async () => {
        if (!image) {
          return null;
        }

        const isBase64DataUrlEncoded = !!image.match(
          /^data:image\/[a-z]+;base64,/
        );
        if (isBase64DataUrlEncoded) {
          const extension = image.match(
            /(?<=^data:image\/)[a-z]+(?=;base64,)/
          )![0];
          const mimeType = `image/${extension}`;
          const fileName = `${
            session.user.id
          }-avatar-${new Date().getTime()}.${extension}`;
          const { blockBlobClient } = await uploadFile(
            blobServiceClient,
            {
              containerName: "avatars",
              fileName,
              fileBuffer: await getResizedAvatarBuffer(
                urlEncodedToBuffer(image)
              ),
            },
            {
              blobHTTPHeaders: {
                blobContentType: mimeType,
              },
            }
          );

          const oldImage = session.user.image;
          if (oldImage) {
            await deleteFile(blobServiceClient, {
              containerName: "avatars",
              fileName: oldImage.split("/").at(-1)!,
            });
          }

          return blockBlobClient.url;
        } else {
          const oldImage = session.user.image;
          if (oldImage === image) {
            return image;
          }
          const response = await fetch(image);
          const mimeType = response.headers.get("content-type");
          if (!mimeType?.startsWith("image/")) {
            throw new Error("Invalid image URL");
          }
          const extension = mimeType.split("/").at(-1)!;
          const fileName = `${
            session.user.id
          }-avatar-${new Date().getTime()}.${extension}`;
          const { blockBlobClient } = await uploadFile(
            blobServiceClient,
            {
              containerName: "avatars",
              fileName,
              fileBuffer: await getResizedAvatarBuffer(
                await response.arrayBuffer()
              ),
            },
            {
              blobHTTPHeaders: {
                blobContentType: mimeType,
              },
            }
          );
          if (oldImage) {
            await deleteFile(blobServiceClient, {
              containerName: "avatars",
              fileName: oldImage.split("/").at(-1)!,
            });
          }

          return blockBlobClient.url;
        }
      };
      const imageUrl = await getImageUrl();

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
          image: imageUrl,
          description,
        },
      });

      return {
        ...user,
        isOnline: true,
      };
    }),

  deleteAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const { prisma, session, blobServiceClient } = ctx;
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: session.user.id,
      },
    });

    if (!user.image) {
      return {
        ...user,
        isOnline: true,
      };
    }

    await deleteFile(blobServiceClient, {
      containerName: "avatars",
      fileName: `${session.user.id}-avatar.png`,
    });

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        image: null,
      },
    });

    return {
      ...updatedUser,
      isOnline: true,
    };
  }),
});
