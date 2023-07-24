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
import { AiOutlineSend } from "react-icons/ai";
import { ImCancelCircle } from "react-icons/im";
import NextLink from "next/link";

import { api } from "~/utils/api";
import UserAvatar from "../../common/UserAvatar";
import { formatSocialMediaDate } from "~/utils/formatting";
import CancelFriendRequestButton from "~/components/common/action-buttons/CancelFriendRequestButton";
import FadingSkeletonStack from "~/components/common/FadingSkeletonStack";
import FriendRequestSkeleton from "~/components/friend-request/FriendRequestSkeleton";

const SentFriendRequestsPanel = () => {
  const sentFriendRequestsQuery = api.friends.getSentFriendRequests.useQuery();
  const friendRequests = sentFriendRequestsQuery.data ?? [];
  const hoverColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");

  return (
    <FadingSkeletonStack
      count={10}
      element={<FriendRequestSkeleton />}
      h="100%"
      isLoading={sentFriendRequestsQuery.isLoading}
      p={2}
    >
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
            <UserAvatar user={friendRequest.to} size="sm" />
            <chakra.span ml={2}>
              <Text fontWeight="bold" letterSpacing={0.5} as="span">
                {friendRequest.to.name}{" "}
              </Text>
              <Text as="span" color="gray.500">
                sent {formatSocialMediaDate(friendRequest.updatedAt)}
              </Text>
            </chakra.span>
            <HStack gap={2} ml="auto">
              <CancelFriendRequestButton
                icon={ImCancelCircle}
                name={friendRequest.to.name}
                userId={friendRequest.to.id}
                variant="outline"
              />
              <Menu placement="bottom-end">
                <MenuButton
                  variant="outline"
                  as={IconButton}
                  aria-label={`Open actions menu for ${friendRequest.to.name}`}
                  icon={<SlOptionsVertical />}
                  rounded="md"
                  size="sm"
                />
                <MenuList>
                  <MenuItem
                    icon={<Icon as={AiOutlineSend} />}
                    as={NextLink}
                    href={`/chat/users/${friendRequest.to.id}`}
                  >
                    Send message
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </chakra.li>
        ))}
      </TabPanel>
    </FadingSkeletonStack>
  );
};

export default SentFriendRequestsPanel;
