"use server";
import { ActionResponse } from "@/actions/response";
import { auth } from "@/auth";
import {
  Permissions,
  checkPermission,
  getPermissionsForRoles,
} from "@/lib/redis/access-control";
import { redirect } from "next/navigation";

export const getSessionPengguna = async () => {
  const session = await auth();
  // logger.info("session", session);
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      message: "Not authenticated",
      error: "Not authenticated",
    };
  }

  return {
    success: true,
    data: session.user,
  };
};

interface SessionPenggunaForActionResponse {
  satkerId: string;
  unitKerjaId: string;
  penggunaId: string;
  penggunaName: string;
}
export const getSessionPenggunaForAction = async (): Promise<
  ActionResponse<SessionPenggunaForActionResponse>
> => {
  const pengguna = await getSessionPengguna();
  // logger.info("Pengguna", pengguna);
  if (
    !pengguna.success ||
    !pengguna.data ||
    !pengguna.data.id ||
    !pengguna.data.unitKerjaId
  ) {
    return {
      success: false,
      error: "E-UAuth-01",
      message: "User not found",
    };
  }

  // if (!pengguna.data?.satkerId && !pengguna.data?.unitKerjaId) {
  //   return {
  //     success: false,
  //     error: "E-UORG-01",
  //     message: "User tidak mempunyai satkerId atau unitKerjaId",
  //   };
  // }

  const satkerId = pengguna.data.satkerId ?? pengguna.data.unitKerjaId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.id;
  const penggunaName = pengguna.data.name!;
  return {
    success: true,
    data: {
      satkerId,
      unitKerjaId,
      penggunaId,
      penggunaName,
    },
  };
};

interface Acl {
  actions: string | string[];
  resource: string;
  attributes?: string[];
  redirectOnUnauthorized?: boolean;
}
export const checkSessionPermission = async ({
  actions,
  resource,
  attributes = [],
  redirectOnUnauthorized = true,
}: Acl) => {
  const pengguna = await getSessionPengguna();
  console.log("[checkSessionPermission]", actions);
  if (!pengguna.success || !pengguna.data?.roles) {
    // redirect to login
    console.error("Pengguna not found or has no roles");
    redirect("/login");
  }

  const roles = pengguna.data.roles;
  console.log("Roles", roles);

  // string to array
  let actionsArray: string[] = [];
  if (typeof actions === "string") {
    actionsArray = [actions];
  } else {
    actionsArray = actions;
  }
  let hasPermission = false;
  // iterate over actions
  console.log("[actionsArray]", actionsArray);
  for (const action of actionsArray) {
    hasPermission = await checkPermission(roles, action, resource);
    console.log("Has permission", action, resource, hasPermission);
    if (hasPermission) {
      return hasPermission;
    }
  }

  //const hasPermission = await checkPermission(roles, action, resource);
  if (!hasPermission && redirectOnUnauthorized) {
    // redirect to unauthorized
    console.error("Unauthorized");
    redirect("/");
  }
  return hasPermission;
};

export const checkClientPermission = async ({
  actions,
  resource,
  attributes = [],
}: Acl): Promise<ActionResponse<boolean>> => {
  const pengguna = await getSessionPengguna();
  console.log("Pengguna", pengguna);
  if (!pengguna.success || !pengguna.data?.roles) {
    return {
      success: false,
      error: "E-CLAUTH-01",
      message: "Role not found",
    };
  }
  const roles = pengguna.data.roles;

  // string to array
  let actionsArray: string[] = [];
  if (typeof actions === "string") {
    actionsArray = [actions];
  } else {
    actionsArray = actions;
  }
  let hasPermission = false;
  // iterate over actions
  for (const action of actionsArray) {
    hasPermission = await checkPermission(roles, action, resource);
    if (hasPermission) {
      return {
        success: true,
        data: hasPermission,
      };
    }
  }
  if (!hasPermission) {
    // redirect to unauthorized
    console.error("Unauthorized");
    return {
      success: false,
      error: "E-CLAUTH-02",
      message: "Unauthorized",
    };
  }
  return {
    success: true,
    data: hasPermission,
  };
};

/**
 * Get logged in user from session
 * jika tidak ada session atau user tidak memiliki id atau unitKerjaId, return null
 * user bisa saja tidak punya satkerId misalnya jika di assign di level Kementerian
 * @returns User object
 */
export const getLoggedInPengguna = async () => {
  const session = await auth();
  console.info("getLoggedInPengguna", session);
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    !session.user.unitKerjaId
    // !session.user.satkerId
  ) {
    return null;
  }
  return session.user;
};

export const getSessionPermissionsForRole =
  async (): Promise<Permissions | null> => {
    const pengguna = await getSessionPengguna();
    if (!pengguna.success || !pengguna.data?.roles) {
      // redirect to login
      console.error("Pengguna not found or has no roles");
      return null;
    }
    const roles = pengguna.data.roles;

    const permissionsForRoles = await getPermissionsForRoles(roles);

    return permissionsForRoles;
  };
