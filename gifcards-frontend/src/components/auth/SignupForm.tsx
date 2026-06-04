import {
  Button,
  Checkbox,
  Field,
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
import { PasswordStrengthHint } from "./PasswordStrengthHint";

const signupSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    acceptedTerms: z.literal(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
  });

type SignupFormProps = {
  onSubmit: (
    fullName: string,
    email: string,
    password: string,
    acceptedTermsAt: string,
  ) => Promise<void>;
  onGoogleSignUp: () => Promise<void>;
};

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
};

export function SignupForm({ onSubmit, onGoogleSignUp }: SignupFormProps) {
  const { t } = useTranslation("auth");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    const parsed = signupSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "fullName") {
          errors.fullName = t("errors.validationFullName");
        }
        if (field === "email") {
          errors.email = t("errors.validationEmail");
        }
        if (field === "password") {
          errors.password = t("errors.validationPassword");
        }
        if (field === "confirmPassword") {
          errors.confirmPassword = t("errors.validationConfirmPassword");
        }
        if (field === "acceptedTerms") {
          errors.acceptedTerms = t("errors.validationTerms");
        }
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        parsed.data.fullName,
        parsed.data.email,
        parsed.data.password,
        new Date().toISOString(),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await onGoogleSignUp();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <VStack as="form" gap={5} align="stretch" onSubmit={handleSubmit}>
      <VStack gap={1} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" color="primary">
          {t("createAccountTitle")}
        </Text>
        <Text color="textSecondary">{t("signupSubtitle")}</Text>
      </VStack>

      <Field.Root invalid={Boolean(fieldErrors.fullName)}>
        <Field.Label color="primary">{t("fullNameLabel")}</Field.Label>
        <Input
          value={fullName}
          placeholder={t("fullNamePlaceholder")}
          bg="surface"
          borderColor="border"
          onChange={(event) => setFullName(event.target.value)}
        />
        {fieldErrors.fullName ? (
          <Field.ErrorText>{fieldErrors.fullName}</Field.ErrorText>
        ) : null}
      </Field.Root>

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
        <Field.Label color="primary">{t("passwordLabel")}</Field.Label>
        <PasswordInput value={password} onChange={setPassword} />
        <PasswordStrengthHint password={password} />
        {fieldErrors.password ? (
          <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
        ) : null}
      </Field.Root>

      <Field.Root invalid={Boolean(fieldErrors.confirmPassword)}>
        <Field.Label color="primary">{t("confirmPasswordLabel")}</Field.Label>
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {fieldErrors.confirmPassword ? (
          <Field.ErrorText>{fieldErrors.confirmPassword}</Field.ErrorText>
        ) : null}
      </Field.Root>

      <Field.Root invalid={Boolean(fieldErrors.acceptedTerms)}>
        <Checkbox.Root
          checked={acceptedTerms}
          onCheckedChange={(details) =>
            setAcceptedTerms(details.checked === true)
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label color="textSecondary" fontSize="sm">
            {t("termsPrefix")}{" "}
            <Link asChild color="secondary">
              <RouterLink to="/terms">{t("termsOfService")}</RouterLink>
            </Link>{" "}
            {t("termsAnd")}{" "}
            <Link asChild color="secondary">
              <RouterLink to="/privacy">{t("privacyPolicy")}</RouterLink>
            </Link>
          </Checkbox.Label>
        </Checkbox.Root>
        {fieldErrors.acceptedTerms ? (
          <Field.ErrorText>{fieldErrors.acceptedTerms}</Field.ErrorText>
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
        {t("createAccountButton")}
      </Button>

      <Separator>{t("orDivider")}</Separator>

      <GoogleSignInButton
        isLoading={isGoogleLoading}
        onClick={handleGoogleSignUp}
      />

      <Text textAlign="center" color="textSecondary">
        {t("alreadyHaveAccount")}{" "}
        <Link asChild color="secondary">
          <RouterLink to="/login">{t("logIn")}</RouterLink>
        </Link>
      </Text>
    </VStack>
  );
}
