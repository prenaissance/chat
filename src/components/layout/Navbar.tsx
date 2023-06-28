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
  ChakraProps,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  SunIcon,
  MoonIcon,
} from "@chakra-ui/icons";
import { signIn, signOut, useSession } from "next-auth/react";

const Links = ["Dashboard", "Projects", "Team"];

const NavLink = ({ children }: { children: ReactNode }) => (
  <Link
    as={NextLink}
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={"#"}
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
          rounded={"full"}
          variant={"link"}
          cursor={"pointer"}
          minW={0}
        >
          <Avatar size={"sm"} src={avatarSrc} />
        </MenuButton>
      ) : (
        <Button
          h={8}
          onClick={() => {
            signIn();
          }}
        >
          Sign in
        </Button>
      )}
      <MenuList alignItems={"center"}>
        <br />
        <Center>
          <Avatar size={"2xl"} src={avatarSrc} />
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
            signOut();
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
      w="100%"
      position="sticky"
      top={0}
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
      borderBottom={"1px solid"}
      borderColor={useColorModeValue("gray.400", "gray.600")}
      {...props}
    >
      <Flex py={2} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={"center"}>
          <Box>Logo</Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
        </HStack>
        <AvatarMenu />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </chakra.nav>
  );
};

export default NavBar;
