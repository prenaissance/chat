import { chakra } from "@chakra-ui/react";
import { memo } from "react";
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
    ml={2}
    lineHeight={1.5}
    top={2}
    pb={2}
    float="right"
    color="gray.500"
    dir="ltr"
  >
    <chakra.span
      fontSize="0.75rem"
      cursor="pointer"
      mr={isSelf ? 2 : 0}
      title={createdAt.toLocaleString()}
    >
      {createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </chakra.span>
    {isSelf && (
      <chakra.span
        position="absolute"
        right="-10px"
        bottom="6px"
        fontSize="1.25rem"
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

export default memo(MessageMeta);
