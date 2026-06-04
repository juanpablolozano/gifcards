import { Flex, HStack, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  getPasswordStrength,
  type PasswordStrengthLevel,
} from "../../lib/passwordStrength";

type PasswordStrengthHintProps = {
  password: string;
};

const strengthColors: Record<PasswordStrengthLevel, string> = {
  weak: "#EF4444",
  fair: "#F59E0B",
  good: "#4F46E5",
  strong: "#10B981",
};

export function PasswordStrengthHint({ password }: PasswordStrengthHintProps) {
  const { t } = useTranslation("auth");

  if (!password) {
    return null;
  }

  const { level, score } = getPasswordStrength(password);

  return (
    <HStack gap={2} align="center">
      <Flex gap={1} flex={1}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Flex
            key={index}
            flex={1}
            height="4px"
            borderRadius="full"
            bg={index < score ? strengthColors[level] : "border"}
          />
        ))}
      </Flex>
      <Text fontSize="sm" color="textSecondary" minW="48px" textAlign="right">
        {t(`passwordStrength.${level}`)}
      </Text>
    </HStack>
  );
}
