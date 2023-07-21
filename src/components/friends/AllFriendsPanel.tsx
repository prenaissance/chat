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
} from "@chakra-ui/react";
import { SlOptionsVertical } from "react-icons/sl";
import { AiOutlineSend } from "react-icons/ai";
import NextLink from "next/link";

import { api } from "~/utils/api";
import UserAvatar from "../common/UserAvatar";
import { formatSocialMediaDate } from "~/utils/formatting";

const AllFriendsPanel = () => {
  const friendsQuery = api.friends.getFriendsWithRequestDate.useQuery();
  const friends = friendsQuery.data ?? [];
  const hoverColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  return (
    <TabPanel as="ul" w="100%" listStyleType="none">
      {friends.map((friend) => (
        <chakra.li
          display="flex"
          gap={1}
          alignItems="flex-end"
          key={friend.id}
          _hover={{
            bgColor: hoverColor,
          }}
          p={2}
        >
          <UserAvatar user={friend} size="sm" />
          <chakra.span ml={2}>
            <Text fontWeight="bold" letterSpacing={0.5} as="span">
              {friend.name}{" "}
            </Text>
            <Text as="span" color="gray.500">
              friends since {formatSocialMediaDate(friend.friendsSince)}
            </Text>
          </chakra.span>
          <Menu isLazy placement="bottom-end">
            <MenuButton
              variant="outline"
              as={IconButton}
              ml="auto"
              aria-label={`Open actions menu for ${friend.name}`}
              icon={<SlOptionsVertical />}
              rounded="md"
            />
            <MenuList>
              <MenuItem
                icon={<Icon as={AiOutlineSend} />}
                as={NextLink}
                href={`/chat/users/${friend.id}`}
              >
                Send message
              </MenuItem>
            </MenuList>
          </Menu>
        </chakra.li>
      ))}
    </TabPanel>
  );
};

export default AllFriendsPanel;
