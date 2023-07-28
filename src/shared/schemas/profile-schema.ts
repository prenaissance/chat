import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  image: z.string().url().nullable(), // including data encoded as base64
  description: z.string().max(200).nullable(),
});
