import {
  Box,
  Button,
  Field,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { z } from "zod";
import { AuthFooter, AuthLayout } from "../components/auth/AuthLayout";
import { toaster } from "../lib/toaster";
import { requestMagicLink } from "../services/walletService";

const emailSchema = z.object({
  email: z.email(),
});

function getWalletPath(magicLink: string): string {
  try {
    const url = new URL(magicLink);
    return `${url.pathname}${url.search}`;
  } catch {
    return magicLink;
  }
}

export function WalletLoginPage() {
  const { t } = useTranslation("dashboard");
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [devMagicLink, setDevMagicLink] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(t("wallet.invalidEmail"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await requestMagicLink(parsed.data.email);
      setSent(true);
      setDevMagicLink(result.magicLink ?? null);
      toaster.create({
        title: t("wallet.linkSent"),
        type: "success",
      });
    } catch {
      toaster.create({
        title: t("wallet.linkError"),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout footer={<AuthFooter />}>
      <VStack as="form" gap={5} align="stretch" onSubmit={(event) => void handleSubmit(event)}>
        <VStack gap={1} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" color="primary">
            {t("wallet.loginTitle")}
          </Text>
          <Text color="textSecondary">{t("wallet.loginSubtitle")}</Text>
        </VStack>

        {sent ? (
          <Box bg="surface" borderRadius="md" p={4}>
            <Text color="primary" fontWeight="medium">
              {t("wallet.checkEmail")}
            </Text>
            <Text fontSize="sm" color="textSecondary" mt={2}>
              {t("wallet.checkEmailHint", { email })}
            </Text>
          </Box>
        ) : null}

        <Field.Root invalid={Boolean(fieldError)}>
          <Field.Label color="primary">{t("wallet.emailLabel")}</Field.Label>
          <Input
            type="email"
            value={email}
            placeholder={t("wallet.emailPlaceholder")}
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
          {sent ? t("wallet.resendLink") : t("wallet.sendLink")}
        </Button>

        {devMagicLink ? (
          <Box bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="md" p={4}>
            <Text fontSize="sm" fontWeight="semibold" color="primary" mb={2}>
              {t("wallet.devMagicLink")}
            </Text>
            <Link asChild color="secondary" fontSize="sm" wordBreak="break-all">
              <RouterLink to={getWalletPath(devMagicLink)}>{devMagicLink}</RouterLink>
            </Link>
          </Box>
        ) : null}
      </VStack>
    </AuthLayout>
  );
}
