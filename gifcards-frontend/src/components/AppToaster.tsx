import { Stack, Toast, Toaster } from "@chakra-ui/react";
import { toaster } from "../lib/toaster";

export function AppToaster() {
  return (
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root width={{ sm: "sm" }}>
          <Toast.Indicator />
          <Stack gap="1" flex="1" maxWidth="100%">
            {toast.title ? <Toast.Title>{toast.title}</Toast.Title> : null}
            {toast.description ? (
              <Toast.Description>{toast.description}</Toast.Description>
            ) : null}
          </Stack>
          <Toast.CloseTrigger />
        </Toast.Root>
      )}
    </Toaster>
  );
}
