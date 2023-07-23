import {
  TabPanel,
  chakra,
  useColorModeValue,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { AiOutlineSend, AiOutlineCheck } from "react-icons/ai";
import NextLink from "next/link";

import { api } from "~/utils/api";
import UserAvatar from "../../common/UserAvatar";
import { formatSocialMediaDate } from "~/utils/formatting";
import AcceptFriendRequestButton from "~/components/common/action-buttons/AcceptFriendRequestButton";

const ReceivedFriendRequestsPanel = () => {
  const receivedFriendRequestsQuery =
    api.friends.getReceivedFriendRequests.useQuery();
  const friendRequests = receivedFriendRequestsQuery.data ?? [];
  const hoverColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  return (
    <TabPanel as="ul" w="100%" listStyleType="none">
      {friendRequests.map((friendRequest) => (
        <chakra.li
          display="flex"
          gap={1}
          alignItems="flex-end"
          key={friendRequest.id}
          _hover={{
            bgColor: hoverColor,
          }}
          p={2}
        >
          <UserAvatar user={friendRequest.from} size="sm" />
          <chakra.span ml={2}>
            <Text fontWeight="bold" letterSpacing={0.5} as="span">
              {friendRequest.from.name}{" "}
            </Text>
            <Text as="span" color="gray.500">
              received {formatSocialMediaDate(friendRequest.updatedAt)}
            </Text>
          </chakra.span>
          <HStack gap={2} ml="auto">
            <AcceptFriendRequestButton
              icon={AiOutlineCheck}
              name={friendRequest.from.name}
              userId={friendRequest.from.id}
              variant="outline"
            />
            <Menu placement="bottom-end">
              <MenuButton
                variant="outline"
                as={IconButton}
                aria-label={`Open actions menu for ${friendRequest.from.name}`}
                icon={<SlOptionsVertical />}
                rounded="md"
                size="sm"
              />
              <MenuList>
                <MenuItem
                  icon={<Icon as={AiOutlineSend} />}
                  as={NextLink}
                  href={`/chat/users/${friendRequest.from.id}`}
                >
                  Send message
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </chakra.li>
      ))}
    </TabPanel>
  );
};

export default ReceivedFriendRequestsPanel;
