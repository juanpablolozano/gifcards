import { Button, Field, Input, Link, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import { AuthFooter, AuthLayout } from "../components/auth/AuthLayout";
import {
  getFirebaseErrorCode,
  mapFirebaseAuthError,
  sendPasswordReset,
} from "../lib/authService";
import { toaster } from "../lib/toaster";

const emailSchema = z.object({
  email: z.email(),
});

export function ForgotPasswordPage() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(undefined);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(t("errors.validationEmail"));
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(parsed.data.email);
      setEmailSent(true);
      toaster.create({
        title: "Password reset email sent",
        description: "Check your inbox for a link to reset your password.",
        type: "success",
      });
    } catch (error) {
      const code = getFirebaseErrorCode(error);
      toaster.create({
        title: t(mapFirebaseAuthError(code)),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout footer={<AuthFooter />}>
      <VStack as="form" gap={5} align="stretch" onSubmit={handleSubmit}>
        <VStack gap={1} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" color="primary">
            Reset your password
          </Text>
          <Text color="textSecondary">
            Enter the email associated with your account and we will send you a reset link.
          </Text>
        </VStack>

        {emailSent ? (
          <VStack gap={4} align="stretch">
            <Text color="textSecondary">
              If an account exists for <strong>{email}</strong>, you will receive a password
              reset email shortly.
            </Text>
            <Button asChild variant="outline" borderColor="border">
              <RouterLink to="/login">Back to login</RouterLink>
            </Button>
          </VStack>
        ) : (
          <>
            <Field.Root invalid={Boolean(fieldError)}>
              <Field.Label color="primary">{t("emailLabel")}</Field.Label>
              <Input
                type="email"
                value={email}
                placeholder={t("emailPlaceholder")}
                bg="surface"
                borderColor="border"
                onChange={(event) => setEmail(event.target.value)}
              />
              {fieldError ? <Field.ErrorText>{fieldError}</Field.ErrorText> : null}
            </Field.Root>

            <Button
              type="submit"
              width="full"
              bg="secondary"
              color="white"
              _hover={{ bg: "#4338CA" }}
              loading={isSubmitting}
            >
              Send reset link
            </Button>
          </>
        )}

        <Text textAlign="center" color="textSecondary">
          Remember your password?{" "}
          <Link asChild color="secondary">
            <RouterLink to="/login">{t("loginButton")}</RouterLink>
          </Link>
        </Text>
      </VStack>
    </AuthLayout>
  );
}
