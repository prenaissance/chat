import { MessageTarget, type Group, type User } from "@prisma/client";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
  createdAt: z.date(),
}) satisfies z.ZodType<User>;

export const groupSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  createdAt: z.date(),
}) satisfies z.ZodType<Group>;

const userTargetSchema = z.object({
  targetType: z.literal(MessageTarget.User),
  targetUserId: z.string().cuid(),
  targetUser: userSchema,
  targetGroupId: z.null(),
  targetGroup: z.null(),
});

const groupTargetSchema = z.object({
  targetType: z.literal(MessageTarget.Group),
  targetGroupId: z.string().cuid(),
  targetGroup: groupSchema,
  targetUserId: z.null(),
  targetUser: z.null(),
});

export const targetSchema = z.union([userTargetSchema, groupTargetSchema]);
export type Target = z.infer<typeof targetSchema>;
