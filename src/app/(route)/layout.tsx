import { AppSidebar } from "@/components/navigation/app-sidebar";
import TopBar from "@/components/navigation/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <TopBar />
      <AppSidebar className="pt-[76px]" />
      <main className="w-full h-max pt-[76px] overflow-auto">{children}</main>
    </SidebarProvider>
  );
};

export default RouteLayout;
