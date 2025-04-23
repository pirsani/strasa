import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { profileRoutes } from "@/route-with-sub";
import { SideBarMenuButtonCustom } from "./sidebar";

// Menu items.

interface ProfileSidebarProps {
  className?: string;
}

export async function ProfileSidebar({ className }: ProfileSidebarProps) {
  return (
    <Sidebar className={cn("gap-0", className)} collapsible="icon">
      <SidebarContent className="gap-0 pb-[300px] pt-4">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {profileRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SideBarMenuButtonCustom item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
