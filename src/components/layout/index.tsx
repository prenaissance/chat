import { useCallback, type ReactNode } from "react";
import NavBar from "./Navbar";
import { chakra } from "@chakra-ui/react";
import { api } from "~/utils/api";
import { UseIntervalOptions, useInterval } from "~/hooks/useInterval";
import { useSession } from "next-auth/react";

const Layout = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const onlineHeartbeatMutation = api.online.heartbeat.useMutation();
  useInterval(onlineHeartbeatMutation.mutate, {
    delay: 1000 * 60,
    isImmediate: true,
    isEnabled: session.status === "authenticated",
  });

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
