import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { AppToaster } from "./components/AppToaster";
import { AuthProvider } from "./providers/AuthProvider";
import { AppRoutes } from "./routes/AppRoutes";
import { system } from "./theme";

export function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <AppToaster />
    </ChakraProvider>
  );
}
