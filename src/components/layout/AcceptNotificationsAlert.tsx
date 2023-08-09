import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CloseButton,
  Divider,
  FormControl,
  FormLabel,
  Switch,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  type NotificationPreferences,
  useNotificationsStore,
} from "~/stores/notifications";

const AcceptNotificationsAlert = () => {
  const [isSecondStage, setIsSecondStage] = useState(false);
  const toast = useToast();
  const setUserAsked = useNotificationsStore((state) => state.setUserAsked);
  const setEnabledPreferences = useNotificationsStore(
    (state) => state.setEnabledPreferences
  );
  const {
    handleSubmit,
    register,
    formState: { isSubmitting },
  } = useForm<NotificationPreferences>({
    defaultValues: {
      messages: true,
      friendRequests: false,
    },
  });

  const onSubmit = useCallback(
    (data: NotificationPreferences) =>
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            setEnabledPreferences(data);
          }
        })
        .finally(() => {
          setUserAsked();
          toast({
            title: "You can change your preferences in profile settings.",
            status: "info",
          });
        }),
    [setEnabledPreferences, setUserAsked, toast]
  );

  const firstStageButton = useMemo(
    () => (
      <Button
        key="firstStage"
        type="button"
        onClick={() => setIsSecondStage(true)}
      >
        Yes
      </Button>
    ),
    [setIsSecondStage]
  );

  const secondStageButton = useMemo(
    () => (
      <Button key="secondStage" type="submit" isLoading={isSubmitting}>
        Confirm
      </Button>
    ),
    [isSubmitting]
  );

  return (
    <Card
      transition="width 0.3s ease"
      as="form"
      aria-live="polite"
      position="absolute"
      p={0.5}
      top={2}
      right={2}
      zIndex="banner"
      onSubmit={
        isSecondStage ? handleSubmit(onSubmit) : (e) => e.preventDefault()
      }
    >
      <CloseButton
        onClick={setUserAsked}
        position="absolute"
        right={1}
        top={0.5}
        size="sm"
      />
      <CardHeader>
        {isSecondStage ? "Select preferences" : "Allow notifications ?"}
      </CardHeader>
      {isSecondStage && (
        <>
          <Divider mx={4} w="auto" />
          <CardBody>
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>Messages</FormLabel>
              <Switch {...register("messages")} />
            </FormControl>
            <FormControl
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormLabel>Friend requests</FormLabel>
              <Switch {...register("friendRequests")} />
            </FormControl>
          </CardBody>
        </>
      )}
      <CardFooter as={ButtonGroup} justifyContent="space-between">
        <Button variant="outline" onClick={setUserAsked}>
          {isSecondStage ? "Cancel" : "No"}
        </Button>
        {isSecondStage ? secondStageButton : firstStageButton}
      </CardFooter>
    </Card>
  );
};

export default AcceptNotificationsAlert;
