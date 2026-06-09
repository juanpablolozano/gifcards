import { Flex, Text } from "@chakra-ui/react";
import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  end?: boolean;
};

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  end,
}: SidebarNavItemProps) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Flex
          align="center"
          gap={3}
          px={4}
          py={3}
          borderLeftWidth="3px"
          borderLeftColor={isActive ? "secondary" : "transparent"}
          bg={isActive ? "surface" : "transparent"}
          color={isActive ? "secondary" : "textSecondary"}
          _hover={{ bg: "surface", color: isActive ? "secondary" : "primary" }}
          transition="background 0.15s, color 0.15s"
        >
          <Icon size={20} />
          <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
            {label}
          </Text>
        </Flex>
      )}
    </NavLink>
  );
}
