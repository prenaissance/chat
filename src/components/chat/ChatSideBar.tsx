import { Stack, useColorModeValue } from "@chakra-ui/react";

const ChatSideBar = () => {
  return (
    <Stack
      h="100%"
      w="10rem"
      borderRight="1px solid"
      borderColor={useColorModeValue("gray.400", "gray.600")}
    ></Stack>
  );
};

export default ChatSideBar;
