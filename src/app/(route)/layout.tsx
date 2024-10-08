import SidebarContariner from "@/components/navigation/sidebar-container";
import TopBar from "@/components/navigation/top-bar";

const RouteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full overflow-hidden">
      <TopBar />
      <div
        id="page-container"
        className="flex flex-row pt-[76px] h-[calc(100vh)]"
      >
        <SidebarContariner />
        <main className="w-full overflow-auto h-full">{children}</main>
      </div>
    </div>
  );
};

export default RouteLayout;
