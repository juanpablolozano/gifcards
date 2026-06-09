import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <Box minH="100vh" bg="surface">
      <Outlet />
    </Box>
  );
}
