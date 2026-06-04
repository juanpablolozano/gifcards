import { IconButton, Input, InputGroup } from "@chakra-ui/react";
import { useState } from "react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function PasswordInput({
  value,
  onChange,
  placeholder,
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputGroup endElement={
      <IconButton
        aria-label={isVisible ? "Hide password" : "Show password"}
        size="sm"
        variant="ghost"
        onClick={() => setIsVisible((current) => !current)}
      >
        {isVisible ? "Hide" : "Show"}
      </IconButton>
    }>
      <Input
        type={isVisible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        bg="surface"
        borderColor="border"
        onChange={(event) => onChange(event.target.value)}
      />
    </InputGroup>
  );
}
