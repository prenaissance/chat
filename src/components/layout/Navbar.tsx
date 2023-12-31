import { type ReactNode } from "react";
import NextLink from "next/link";
import {
  chakra,
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Center,
  SkeletonCircle,
  Collapse,
  useColorMode,
  type ChakraProps,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, SunIcon, MoonIcon } from "@chakra-ui/icons";
import { signIn, signOut, useSession } from "next-auth/react";
import CorrespondentsSearch from "./correspondents-search";

const links = [
  {
    name: "Chat",
    href: "/chat",
  },
  {
    name: "Friends",
    href: "/friends",
  },
];

const NavLink = ({ children, href }: { children: ReactNode; href: string }) => (
  <Link
    as={NextLink}
    px={2}
    py={1}
    rounded="md"
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={href}
  >
    {children}
  </Link>
);

const AvatarMenu = () => {
  const session = useSession();
  const { colorMode, toggleColorMode } = useColorMode();
  const avatarSrc =
    session?.data?.user.image ??
    "https://avatars.githubusercontent.com/u/5308588?v=4";

  return (
    <Menu>
      {session.status === "loading" ? (
        <SkeletonCircle />
      ) : session.data ? (
        <MenuButton
          as={Button}
          rounded="full"
          variant="link"
          cursor="pointer"
          minW={0}
        >
          <Avatar size="sm" src={avatarSrc} />
        </MenuButton>
      ) : (
        <Button
          h={8}
          onClick={() => {
            void signIn();
          }}
        >
          Sign in
        </Button>
      )}
      <MenuList alignItems="center">
        <br />
        <Center>
          <Avatar size="2xl" src={avatarSrc} />
        </Center>
        <br />
        <Center>
          <p>{session.data?.user?.name}</p>
        </Center>
        <br />
        <MenuDivider />
        <MenuItem as={NextLink} href="/profile">
          Profile
        </MenuItem>
        <MenuItem onClick={toggleColorMode}>
          <HStack alignItems="center">
            <span>Switch Theme</span>
            {colorMode === "light" ? <SunIcon /> : <MoonIcon />}
          </HStack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            void signOut();
          }}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const NavBar = (props: ChakraProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <chakra.nav
      zIndex="dropdown"
      w="100%"
      position="sticky"
      top={0}
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.400", "gray.600")}
      {...props}
    >
      <Flex py={2} alignItems="center" justifyContent="space-between">
        <IconButton
          size="md"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Open Menu"
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems="center">
          <Box>Logo</Box>
          <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
            <CorrespondentsSearch />
            {links.map(({ name, href }) => (
              <NavLink key={href} href={href}>
                {name}
              </NavLink>
            ))}
          </HStack>
        </HStack>
        <AvatarMenu />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: "none" }}>
          <Stack as="nav" spacing={4}>
            {links.map(({ name, href }) => (
              <NavLink key={href} href={href}>
                {name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </chakra.nav>
  );
};

export default NavBar;
