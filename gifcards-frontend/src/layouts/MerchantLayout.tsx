import { Box, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "../components/dashboard/DashboardTopBar";

export function MerchantLayout() {
  return (
    <Flex minH="100vh" bg="surface">
      <DashboardSidebar />

      <Flex direction="column" flex="1" minW={0}>
        <DashboardTopBar />

        <Box as="main" flex="1" p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
