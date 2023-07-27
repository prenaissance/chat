import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { deleteFile, uploadFile } from "~/server/services/file-upload";
import { urlEncodedToBuffer } from "~/server/services/encoding";

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
    .input(
      z.object({
        name: z.string().min(1).max(50).optional(),
        image: z.string().url().nullish(), // including data encoded as base64
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, image } = input;
      const { prisma, session, blobServiceClient } = ctx;
      const isBase64UrlEncoded = image?.match(/^data:image\/[a-z]+;base64,/);
      const imageUrl = isBase64UrlEncoded
        ? await uploadFile(
            blobServiceClient,
            {
              containerName: "avatars",
              fileName: `${session.user.id}-avatar.png`,
              fileBuffer: urlEncodedToBuffer(image!),
            },
            {
              blobHTTPHeaders: {
                blobContentType:
                  image!.match(/(?<=^data:)image\/[a-z]+(?=;base64,)/)?.[0] ??
                  "image/png",
              },
            }
          ).then(({ blockBlobClient }) => blockBlobClient.url)
        : image;

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name,
          image: imageUrl,
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
