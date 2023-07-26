import { Button, type ButtonProps, Input } from "@chakra-ui/react";
import {
  type InputHTMLAttributes,
  forwardRef,
  memo,
  useRef,
  useCallback,
  type ForwardedRef,
  useImperativeHandle,
} from "react";

type Props = Omit<ButtonProps, "type" | "onChange"> &
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "accept" | "capture" | "multiple" | "onChange"
  > & {
    label?: string;
  };

const FileUpload = (
  {
    label = "Upload File",
    onChange,
    accept,
    capture,
    multiple,
    ...props
  }: Props,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);
  return (
    <>
      <Button {...props} onClick={handleClick}>
        {label}
      </Button>
      <Input
        type="file"
        ref={inputRef}
        onChange={onChange}
        accept={accept}
        capture={capture}
        multiple={multiple}
        opacity={0}
        position="absolute"
        zIndex={-1}
      />
    </>
  );
};

export default memo(forwardRef(FileUpload));
