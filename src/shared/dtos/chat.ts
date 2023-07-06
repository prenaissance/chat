import { type Message, type User } from "@prisma/client";
import { type Target } from "../schemas/target-schema";

export type MessageDTO = Message &
  Target & {
    from: User;
  };
