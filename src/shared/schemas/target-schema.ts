import { MessageTarget, type Group, type User } from "@prisma/client";
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
  description: z.string().max(200).nullable(),
  createdAt: z.date(),
  lastSeenAt: z.date(),
}) satisfies z.ZodType<User>;

export const groupSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  createdAt: z.date(),
  users: z.array(userSchema),
}) satisfies z.ZodType<Group>;

export type TargetGroup = z.infer<typeof groupSchema>;

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
