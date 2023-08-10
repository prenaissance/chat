import { useEffect, type ReactNode, useState } from "react";
import { ScaleFade, chakra } from "@chakra-ui/react";
import { useSession } from "next-auth/react";

import NavBar from "./Navbar";
import { api } from "~/utils/api";
import { useInterval } from "~/hooks/useInterval";
import { useNotificationsStore } from "~/stores/notifications";
import AcceptNotificationsAlert from "./AcceptNotificationsAlert";
import { useNotifications } from "~/hooks/useNotifications";

const Layout = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const wasUserAsked = useNotificationsStore((state) => state.wasUsedAsked);
  const onlineHeartbeatMutation = api.online.heartbeat.useMutation();
  const [showNotificationRequest, setShowNotificationRequest] = useState(false);
  useNotifications();
  useInterval(onlineHeartbeatMutation.mutate, {
    delay: 1000 * 60,
    isImmediate: true,
    isEnabled: session.status === "authenticated",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (session.status === "authenticated") {
        setShowNotificationRequest(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [session.status, setShowNotificationRequest]);

  return (
    <>
      <ScaleFade
        initialScale={0.9}
        in={showNotificationRequest && !wasUserAsked}
      >
        <AcceptNotificationsAlert />
      </ScaleFade>
      <NavBar h="3rem" />
      <chakra.main display="flex" flexDir="column" height="calc(100vh - 3rem)">
        {children}
      </chakra.main>
    </>
  );
};

export default Layout;
