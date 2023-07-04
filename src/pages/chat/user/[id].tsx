import { useRouter } from "next/router";
import ChatLayout from "~/components/chat/ChatLayout";

const UserChat = () => {
  const router = useRouter();
  const userId = router.query.id as string;

  return <ChatLayout>{userId}</ChatLayout>;
};

export default UserChat;
