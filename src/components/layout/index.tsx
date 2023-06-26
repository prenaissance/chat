import type { ReactNode } from "react";
import NavBar from "./Navbar";
import { Flex, chakra } from "@chakra-ui/react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex flexDir="column" minH="100vh">
      <NavBar />
      <chakra.main flexGrow={1}>{children}</chakra.main>
    </Flex>
  );
};

export default Layout;
