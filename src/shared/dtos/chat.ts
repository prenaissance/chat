import { type Message } from "@prisma/client";
import { type Target } from "../schemas/target-schema";
import { type OnlineStatusUser } from "./user";

export type MessageDTO = Message &
  Target & {
    from: OnlineStatusUser;
  };
