import { type User, MessageTarget } from "@prisma/client";
import { type TargetGroup } from "../schemas/target-schema";

export type TargetInput =
  | {
      targetType: MessageTarget;
      targetUserId?: string | null;
      targetUser?: User | null;
      targetGroupId?: string | null;
      targetGroup?: TargetGroup | null;
    }
  | {
      targetType: MessageTarget;
      targetUserId?: string;
      targetUser?: User;
      targetGroupId?: string | null;
      targetGroup?: TargetGroup | null;
    }
  | {
      targetType: MessageTarget;
      targetUserId?: string | null;
      targetUser?: User | null;
      targetGroupId?: string;
      targetGroup?: TargetGroup;
    };

export const toTargetDto = <T extends TargetInput>(input: T) =>
  input.targetType === MessageTarget.User
    ? {
        ...input,
        targetType: MessageTarget.User,
        targetUserId: input.targetUserId!,
        targetUser: input.targetUser!,
        targetGroupId: null,
        targetGroup: null,
      }
    : {
        ...input,
        targetType: MessageTarget.Group,
        targetUserId: null,
        targetUser: null,
        targetGroupId: input.targetGroupId!,
        targetGroup: input.targetGroup!,
      };
