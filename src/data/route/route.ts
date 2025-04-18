"use server";
import { getSessionPermissionsForRole } from "@/actions/pengguna/session";
import { Permissions } from "@/lib/redis/access-control";
import {
  alurProsesRoutes,
  dashboardRoutes,
  dataReferensiRoutesWithSub,
  RouteItem,
} from "@/route-with-sub";

// Implement route from some settings
export const getRoutesReferensiForRoles = async (): Promise<{
  filteredRouteDashboard: RouteItem[];
  filteredRouteReferensi: RouteItem[];
  filteredRoutesAlurProses: RouteItem[];
}> => {
  const permissions: Permissions | null = await getSessionPermissionsForRole();
  if (!permissions) {
    return {
      filteredRouteReferensi: [],
      filteredRoutesAlurProses: [],
      filteredRouteDashboard: [],
    };
  }

  const filteredRouteDashboard = dashboardRoutes.filter((route) => {
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

  // const filteredRouteReferensi = dataReferensiRoutes.filter((route) => {
  //   if (route.resources) {
  //     // Check if any of the route's resources are present in the permissions
  //     return route.resources.some((resource) => {
  //       const resourcePermissions = permissions[resource];
  //       if (!resourcePermissions) return false;

  //       // Optionally, check specific actions if needed
  //       return Object.keys(resourcePermissions).length > 0;
  //     });
  //   }
  //   return true; // Include routes without resources by default
  // });

  let filteredRouteReferensi: RouteItem[] = [];

  dataReferensiRoutesWithSub.forEach((route) => {
    if (route.subs) {
      const filteredSubs = route.subs.filter((subRoute) => {
        if (subRoute.resources) {
          // Check if any of the sub-route's resources are present in the permissions
          return subRoute.resources.some((resource) => {
            const resourcePermissions = permissions[resource];
            if (!resourcePermissions) return false;

            // Optionally, check specific actions if needed
            return Object.keys(resourcePermissions).length > 0;
          });
        }
        return true; // Include sub-routes without resources by default
      });

      if (filteredSubs.length > 0) {
        filteredRouteReferensi.push({ ...route, subs: filteredSubs });
      }
    }
  });

  const filteredRoutesAlurProses = alurProsesRoutes.filter((route) => {
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

  return {
    filteredRoutesAlurProses,
    filteredRouteReferensi,
    filteredRouteDashboard,
  };
};
