import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export function StorefrontLayout() {
  return (
    <Box minH="100vh" bg="white">
      <Outlet />
    </Box>
  );
}
