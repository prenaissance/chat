import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, "The name must be at least 1 character long")
    .max(50, "The name cannot be longer than 50 characters"),
  members: z.array(z.string().cuid()),
});

export type CreateGroup = z.infer<typeof createGroupSchema>;
