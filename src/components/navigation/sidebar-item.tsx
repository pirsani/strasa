"use client";
import { useIsLoading } from "@/hooks/use-loading";
import { cn } from "@/lib/utils";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";

interface SidebarItemProps {
  icon: LucideIcon;
  title: string;
  href: string;
  collapsed: boolean;
  counter?: number;
}
const SidebarItem = ({
  icon: Icon,
  title,
  href,
  collapsed,
  counter,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsLoading } = useIsLoading();
  const isActive = (pathname === "/" && href === "/") || pathname === href;

  const handleOnClick = () => {
    // check if the current route is the same as the clicked route
    if (pathname === href) {
      return;
    }
    setIsLoading(true);
  };

  return (
    <Link
      href={href}
      onClick={handleOnClick}
      type="button"
      className={cn(
        "relative",
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20 w-full",
        isActive &&
          "text-slate-700 bg-sky-200/20 hover:bg-sky-200/20 hover:text-sky-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-2 flex-grow">
        {!collapsed && (
          <Icon
            size={22}
            className={cn(
              "hidden sm:block text-slate-500",
              isActive && "text-sky-700"
            )}
          />
        )}
        {collapsed && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Icon
                  size={22}
                  className={cn(
                    "hidden sm:block text-slate-500",
                    isActive && "text-sky-700"
                  )}
                />
              </TooltipTrigger>
              <TooltipContent align="center" side="right" className="ml-2">
                <span className="text-slate-500">{title}</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <span className={cn(collapsed ? "hidden" : "block")}>{title}</span>
      </div>
    </Link>
  );
};

export default SidebarItem;
