"use client";
import { SidebarMenuBadge, SidebarMenuButton } from "@/components/ui/sidebar";
import { RouteItem } from "@/route-with-sub";
import Link from "next/link";
import { createElement, useEffect, useState } from "react";

import { getCountStatusPengajuan } from "@/actions/kegiatan/riwayat-kegiatan";
import { useIsLoading } from "@/hooks/use-loading";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Banknote,
  BookOpen,
  BrickWall,
  CheckCircle2,
  Circle,
  Coins,
  CreditCard,
  FileBadge,
  Flag,
  Gauge,
  GraduationCap,
  Grid,
  Home,
  Hourglass,
  Info,
  Key,
  List,
  ListChecks,
  ListTree,
  LucideIcon,
  MapPinned,
  Milestone,
  MonitorPause,
  MonitorPlay,
  Settings,
  Settings2,
  Signature,
  SquareActivity,
  Table,
  User,
  UserCog,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { usePathname } from "next/navigation";

const iconMap: { [key: string]: LucideIcon } = {
  home: Home,
  user: User,
  settings: Settings,
  warning: AlertTriangle,
  key: Key,
  "square-asterisk": Hourglass,
  "settings-2": Settings2,
  milestone: Milestone,
  "list-checks": ListChecks,
  "checkmark-circle-2": CheckCircle2,
  "credit-card": CreditCard,
  table: Table,
  circle: Circle,
  list: List,
  "graduation-cap": GraduationCap,
  banknote: Banknote,
  coins: Coins,
  signature: Signature,
  "user-cog": UserCog,
  users: Users,
  "brick-wall": BrickWall,
  "file-badge": FileBadge,
  "map-pinned": MapPinned,
  flag: Flag,
  "book-open": BookOpen,
  grid: Grid,
  gauge: Gauge,
  "monitor-pause": MonitorPause,
  "monitor-play": MonitorPlay,
  "square-activity": SquareActivity,
  wallet: Wallet,
  info: Info,
  "list-tree": ListTree,
  "users-round": UsersRound,
};

interface SideBarMenuButtonCustomProps {
  item: RouteItem;
}
export const SideBarMenuButtonCustom = ({
  item,
}: SideBarMenuButtonCustomProps) => {
  const pathname = usePathname();
  const { setIsLoading } = useIsLoading();
  const isActive =
    (pathname === "/" && item.href === "/") || pathname === item.href;
  const Icon = iconMap[item.iconName] || AlertTriangle; // Map the icon string to the actual icon component
  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={item.href}>
        {createElement(Icon, {
          className: "h-4 w-4",
        })}
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
};

interface SideBarMenuButtonWithBadgeProps {
  item: RouteItem;
}
export const SideBarMenuButtonWithBadge = ({
  item,
  ...props
}: SideBarMenuButtonWithBadgeProps) => {
  const pathname = usePathname();
  const isActive =
    (pathname === "/" && item.href === "/") || pathname === item.href;
  const Icon = iconMap[item.iconName] || AlertTriangle; // Map the icon string to the actual icon component
  return (
    <>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={item.href}>
          {createElement(Icon, {
            className: "h-4 w-4",
          })}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuBadgeCounter item={item} />
    </>
  );
};

interface SidebarMenuBadgeCounterProps {
  item: RouteItem;
}

const SidebarMenuBadgeCounter = ({ item }: SidebarMenuBadgeCounterProps) => {
  const [itemCount, setItemCount] = useState<number>(0);
  useEffect(() => {
    // Simulate an API call to fetch the count
    const fetchCount = async () => {
      const count = await getCountStatusPengajuan(item.name);
      setItemCount(count);
    };
    fetchCount();
  }, [item]);
  return (
    <SidebarMenuBadge
      className={cn(
        "rounded-full",
        itemCount > 0 ? "bg-red-500 text-white" : "hidden"
      )}
    >
      {itemCount}
    </SidebarMenuBadge>
  );
};
