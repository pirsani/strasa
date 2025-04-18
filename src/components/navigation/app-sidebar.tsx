import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getRoutesReferensiForRoles } from "@/data/route/route";
import { cn } from "@/lib/utils";
import { dashboardRoutes } from "@/route-with-sub";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import SideBarMenuButtonCustom from "./sidebar";

// Menu items.

interface AppSidebarProps {
  className?: string;
}

export async function AppSidebar({ className }: AppSidebarProps) {
  const {
    filteredRouteDashboard,
    filteredRoutesAlurProses,
    filteredRouteReferensi,
  } = await getRoutesReferensiForRoles();

  return (
    <Sidebar className={cn("gap-0", className)} collapsible="icon">
      <SidebarContent className="gap-0 pb-[300px] pt-4">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardRoutes.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SideBarMenuButtonCustom item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="py-0">
          <SidebarGroupLabel>Proses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredRoutesAlurProses.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SideBarMenuButtonCustom item={item} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Data Referensi</SidebarGroupLabel>
          {filteredRouteReferensi.map((item) => {
            return (
              <Collapsible
                defaultOpen={false}
                className="group/collapsible"
                key={item.title}
              >
                <SidebarGroup className="py-0">
                  <SidebarGroupLabel asChild className="text-sm">
                    <CollapsibleTrigger>
                      {item.title}
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {item.subs?.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SideBarMenuButtonCustom item={item} />
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
