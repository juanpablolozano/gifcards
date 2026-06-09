import { Badge } from "@chakra-ui/react";

const statusColors: Record<string, string> = {
  active: "green",
  paused: "gray",
  draft: "orange",
  archived: "red",
  completed: "green",
  purchase: "blue",
  redemption: "purple",
  partially_redeemed: "yellow",
  redeemed: "gray",
};

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorPalette = statusColors[status] ?? "gray";
  return (
    <Badge colorPalette={colorPalette} variant="subtle" textTransform="capitalize">
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
