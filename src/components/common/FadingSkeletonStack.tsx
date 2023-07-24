import { Stack, type StackProps } from "@chakra-ui/react";
import { cloneElement, type ReactElement, type ReactNode } from "react";

type Props = {
  count?: number;
  isLoading?: boolean;
  children: ReactNode;
  element: ReactElement;
} & StackProps;

const FadingSkeletonStack = ({
  count = 5,
  isLoading = true,
  children,
  element,
  ...props
}: Props) => {
  if (count < 1) {
    throw new Error("count must be greater than 0");
  }

  const skeleton = (
    <Stack spacing={2} overflowY="hidden" aria-busy {...props}>
      {Array.from({ length: count }).map((_, i) =>
        cloneElement(element, {
          key: i,
          style: {
            opacity: 1 - i / count,
          },
        })
      )}
    </Stack>
  );

  return isLoading ? skeleton : children;
};

export default FadingSkeletonStack;
