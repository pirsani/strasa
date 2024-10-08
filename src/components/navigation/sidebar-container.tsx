import {
  alurProsesRoutes,
  dashboardRoutes,
  dataReferensiRoutes,
  publicRoutes,
} from "@/route";
import SidebarItems from "./sidebar-items";

// TODO
// Implement route from some settings

const SidebarContariner = () => {
  return (
    <div className="h-full bg-gray-100">
      <div className="h-full overflow-y-auto pb-6">
        <SidebarItems routes={publicRoutes} />
        <SidebarItems routes={dashboardRoutes} />
        <SidebarItems routes={alurProsesRoutes} groupTitle="Alur Proses" />
        <SidebarItems
          routes={dataReferensiRoutes}
          groupTitle="Tabel Referensi"
        />
      </div>
    </div>
  );
};

export default SidebarContariner;
