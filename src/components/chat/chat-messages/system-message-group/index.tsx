import { Flex, Text, chakra } from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import { type UserInfo } from "~/components/common/types/user";
import { type ChatMessage } from "../types";
import { formatSocialMediaDate } from "~/utils/formatting";

export type SystemMessageGroup = {
  messages: ChatMessage[];
  user: UserInfo;
};

const SystemMessageGroupComponent = ({
  messages,
  user,
}: SystemMessageGroup) => {
  if (messages.length === 0) return null;

  return (
    <Flex alignItems="center" flexDirection="column" px={2} py={1}>
      {messages.map((message) => (
        <Text
          cursor="help"
          key={message.createdAt.getTime()}
          fontSize="sm"
          color="gray.500"
          title={`Action done ${formatSocialMediaDate(message.createdAt)}`}
        >
          {message.content}
          <chakra.span title={`Action triggered by ${user.name}`}>
            <InfoIcon ml={1} mb={0.5} />
          </chakra.span>
        </Text>
      ))}
    </Flex>
  );
};

export default SystemMessageGroupComponent;
