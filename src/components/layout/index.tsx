import { useEffect, type ReactNode, useState } from "react";
import { chakra } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import NavBar from "./Navbar";
import { api } from "~/utils/api";
import { useInterval } from "~/hooks/useInterval";
import { useNotificationsStore } from "~/stores/notifications";

const Layout = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const onlineHeartbeatMutation = api.online.heartbeat.useMutation();
  const [showNotificationRequest, setShowNotificationRequest] = useState(false);
  useInterval(onlineHeartbeatMutation.mutate, {
    delay: 1000 * 60,
    isImmediate: true,
    isEnabled: session.status === "authenticated",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      const { wasUsedAsked } = useNotificationsStore.getState();
      if (session.status === "authenticated" && !wasUsedAsked) {
        setShowNotificationRequest(true);
      }
    });

    return () => {
      clearTimeout(timeout);
    };
  });

  return (
    <>
      {showNotificationRequest && (
        <chakra.div aria-live="polite" position="sticky" top={0} zIndex={1}>
          Placeholder
        </chakra.div>
      )}
      <NavBar h="3rem" />
      <chakra.main display="flex" flexDir="column" height="calc(100vh - 3rem)">
        {children}
      </chakra.main>
    </>
  );
};

export default Layout;
