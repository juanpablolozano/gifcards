import {
  Button,
  Field,
  Flex,
  Input,
  Link,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { PasswordInput } from "./PasswordInput";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
};

export function LoginForm({ onSubmit, onGoogleSignIn }: LoginFormProps) {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email") {
          errors.email = t("errors.validationEmail");
        }
        if (field === "password") {
          errors.password = t("errors.validationPassword");
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(parsed.data.email, parsed.data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await onGoogleSignIn();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <VStack as="form" gap={5} align="stretch" onSubmit={handleSubmit}>
      <VStack gap={1} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="primary">
          {t("welcomeBack")}
        </Text>
        <Text color="textSecondary">{t("loginSubtitle")}</Text>
      </VStack>

      <Field.Root invalid={Boolean(fieldErrors.email)}>
        <Field.Label color="primary">{t("emailLabel")}</Field.Label>
        <Input
          type="email"
          value={email}
          placeholder={t("emailPlaceholder")}
          bg="surface"
          borderColor="border"
          onChange={(event) => setEmail(event.target.value)}
        />
        {fieldErrors.email ? (
          <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
        ) : null}
      </Field.Root>

      <Field.Root invalid={Boolean(fieldErrors.password)}>
        <Flex justify="space-between" align="center" mb={1}>
          <Field.Label color="primary">{t("passwordLabel")}</Field.Label>
          <Link asChild color="secondary" fontSize="sm">
            <RouterLink to="/forgot-password">{t("forgotPassword")}</RouterLink>
          </Link>
        </Flex>
        <PasswordInput value={password} onChange={setPassword} />
        {fieldErrors.password ? (
          <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
        ) : null}
      </Field.Root>

      <Button
        type="submit"
        width="full"
        bg="secondary"
        color="white"
        _hover={{ bg: "#4338CA" }}
        loading={isSubmitting}
      >
        {t("loginButton")}
      </Button>

      <Separator>{t("orDivider")}</Separator>

      <GoogleSignInButton
        isLoading={isGoogleLoading}
        onClick={handleGoogleSignIn}
      />

      <Text textAlign="center" color="textSecondary">
        {t("noAccount")}{" "}
        <Link asChild color="secondary">
          <RouterLink to="/signup">{t("signUp")}</RouterLink>
        </Link>
      </Text>
    </VStack>
  );
}
