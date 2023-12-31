import { chakra, Input, IconButton, type ChakraProps } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  type ChangeEvent,
  type FormEventHandler,
  useCallback,
  useState,
} from "react";

type Props<T> = {
  onSendMessage: (message: string) => Promise<T> | T;
  isLoading?: boolean;
} & ChakraProps;

const MessageInput = <T,>({
  onSendMessage,
  isLoading = false,
  ...props
}: Props<T>) => {
  const [typedMessage, setTypedMessage] = useState("");

  const handleTypedMessageChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setTypedMessage(e.target.value),
    []
  );
  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    void Promise.resolve(onSendMessage(typedMessage)).then(() =>
      setTypedMessage("")
    );
  };

  return (
    <chakra.form
      h={8}
      onSubmit={handleSubmit}
      display="flex"
      mb={2}
      gap={1}
      {...props}
    >
      <Input
        placeholder="Type a new message"
        value={typedMessage}
        onChange={handleTypedMessageChange}
        flexGrow={1}
        variant="filled"
      />
      <IconButton
        variant="ghost"
        type="submit"
        aria-label="Send message"
        icon={<ArrowForwardIcon />}
        disabled={!typedMessage}
        isLoading={isLoading}
      />
    </chakra.form>
  );
};

export default MessageInput;
