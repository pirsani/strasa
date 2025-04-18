import { AppSidebar } from "@/components/navigation/app-sidebar";
import TopBar from "@/components/navigation/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

const RouteLayout = async ({ children }: { children: React.ReactNode }) => {
  // const cookieStore = await cookies();
  // const defaultOpen =
  //   cookieStore.get("sidebar-open")?.value === "false" ? false : true;
  // console.log("defaultOpen", defaultOpen);

  return (
    <div className="flex flex-col w-full h-full bg-gray-100">
      <SidebarProvider defaultOpen={true}>
        <TopBar />
        <AppSidebar className="top-[76px]" />
        <main className="w-full h-full pt-[76px]">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default RouteLayout;
