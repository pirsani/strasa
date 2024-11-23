"use server";
import { getSessionPermissionsForRole } from "@/actions/pengguna/session";
import { Permissions } from "@/lib/redis/access-control";
import {
  alurProsesRoutes,
  dashboardRoutes,
  dataReferensiRoutes,
  publicRoutes,
  RouteItem,
} from "@/route";
import SidebarItems from "./sidebar-items";

// TODO
// Implement route from some settings
const getRoutesReferensiForRoles = async (): Promise<{
  routeReferensiPage: RouteItem[];
  routesAlurProses: RouteItem[];
}> => {
  const permissions: Permissions = await getSessionPermissionsForRole();

  const routeReferensiPage = dataReferensiRoutes.filter((route) => {
    if (route.resources) {
      // Check if any of the route's resources are present in the permissions
      return route.resources.some((resource) => {
        const resourcePermissions = permissions[resource];
        if (!resourcePermissions) return false;

        // Optionally, check specific actions if needed
        return Object.keys(resourcePermissions).length > 0;
      });
    }
    return true; // Include routes without resources by default
  });

  const routesAlurProses = alurProsesRoutes.filter((route) => {
    if (route.resources) {
      // Check if any of the route's resources are present in the permissions
      return route.resources.some((resource) => {
        const resourcePermissions = permissions[resource];
        if (!resourcePermissions) return false;

        // Optionally, check specific actions if needed
        return Object.keys(resourcePermissions).length > 0;
      });
    }
    return true; // Include routes without resources by default
  });

  return { routesAlurProses, routeReferensiPage };
};

const SidebarContariner = async () => {
  const { routeReferensiPage, routesAlurProses } =
    await getRoutesReferensiForRoles();
  console.log("route referensi", routeReferensiPage);
  return (
    <div className="h-full bg-gray-100">
      <div className="h-full overflow-y-auto pb-6">
        <SidebarItems routes={publicRoutes} />
        <SidebarItems routes={dashboardRoutes} />
        <SidebarItems routes={routesAlurProses} groupTitle="Alur Proses" />
        <SidebarItems
          routes={routeReferensiPage}
          groupTitle="Tabel Referensi"
        />
      </div>
    </div>
  );
};

export default SidebarContariner;
