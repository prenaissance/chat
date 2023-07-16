import { type Message, type User } from "@prisma/client";
import { type Target } from "../schemas/target-schema";
import { OnlineStatusUser } from "./user";

export type MessageDTO = Message &
  Target & {
    from: OnlineStatusUser;
  };
