import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1).max(50),
  members: z.array(z.string().cuid()),
});
