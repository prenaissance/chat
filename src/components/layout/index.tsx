import type { ReactNode } from "react";
import NavBar from "./Navbar";
import { chakra } from "@chakra-ui/react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NavBar h="3rem" />
      <chakra.main display="flex" flexDir="column" height="calc(100vh - 3rem)">
        {children}
      </chakra.main>
    </>
  );
};

export default Layout;
