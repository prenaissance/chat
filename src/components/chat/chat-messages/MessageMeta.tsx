import { chakra } from "@chakra-ui/react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

type MessageMetaProps = {
  createdAt: Date;
  isSent: boolean;
  isRead: boolean;
  isSelf: boolean;
};

const MessageMeta = ({
  createdAt,
  isSent,
  isRead,
  isSelf,
}: MessageMetaProps) => (
  <chakra.span
    position="relative"
    mr={1}
    lineHeight={1.5}
    ml={2}
    color="gray.500"
    dir="ltr"
  >
    <chakra.span fontSize="0.75rem" title={createdAt.toLocaleString()}>
      {createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </chakra.span>
    {isSelf && (
      <chakra.span
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        right="-1.5rem"
        fontSize="0.75rem"
      >
        {isSent ? (
          isRead ? (
            <BsCheckAll />
          ) : (
            <BsCheck />
          )
        ) : (
          <chakra.span>...</chakra.span>
        )}
      </chakra.span>
    )}
  </chakra.span>
);

export default MessageMeta;
