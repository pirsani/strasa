import { dbHonorarium } from "@/lib/db-honorarium";
import redis from "@/lib/redis";
import { AccessControl } from "accesscontrol";

const ACCESS_CONTROL_KEY = "accesscontrol:roles";

interface Permission {
  resource: string;
  action: string;
}

export interface Permissions {
  [resource: string]: {
    [action: string]: string[];
  };
}

interface Grants {
  [role: string]: RolePermissions;
}

interface RolePermissions {
  permissions: Permission[];
  extendedRoles: string[];
}

interface RolePermissionsMap {
  [roleName: string]: RolePermissions;
}

// Helper to check if AccessControl is loaded in Redis
export async function isAccessControlLoaded(): Promise<boolean> {
  const data = await redis.get(ACCESS_CONTROL_KEY);
  return Boolean(data);
}

// Initialize and cache AccessControl
export async function initializeAccessControl() {
  const roles = await dbHonorarium.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
      extends: {
        include: { baseRole: true },
      },
    },
  });

  const rolePermissions: Record<string, any> = {};
  const ac = new AccessControl();

  for (const role of roles) {
    const permissions = role.permissions.map((rp) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }));

    const extendedRoles = role.extends.map((ext) => ext.baseRole.name);

    rolePermissions[role.name] = { permissions, extendedRoles };

    // Grant permissions
    permissions.forEach(({ resource, action }) => {
      ac.grant({
        role: role.name,
        resource,
        action,
      });
    });

    // Extend roles
    extendedRoles.forEach((baseRole) => {
      ac.grant(role.name).extend(baseRole);
    });
  }

  // Cache AccessControl rules in Redis
  await redis.set(ACCESS_CONTROL_KEY, JSON.stringify(rolePermissions));
  console.log("AccessControl initialized and cached");
}

// Load AccessControl from Redis
export async function loadAccessControl(): Promise<AccessControl | null> {
  const cachedRoles = await redis.get(ACCESS_CONTROL_KEY);

  if (!cachedRoles) {
    console.error(
      "AccessControl rules are not initialized. Please initialize first."
    );
    return null;
  }

  const rolePermissions: RolePermissionsMap = JSON.parse(cachedRoles);
  const ac = new AccessControl();

  for (const [roleName, { permissions, extendedRoles }] of Object.entries(
    rolePermissions
  )) {
    // Grant permissions
    permissions.forEach(({ resource, action }: any) => {
      ac.grant({
        role: roleName,
        resource,
        action,
      });
    });

    // Extend roles
    extendedRoles.forEach((baseRole: string) => {
      ac.grant(roleName).extend(baseRole);
    });
  }

  console.log("AccessControl rules loaded from Redis");
  return ac;
}

// Permission checker
export async function checkPermission(
  role: string | string[],
  action: string,
  resource: string
): Promise<boolean> {
  await initAcl();
  const ac = await loadAccessControl();

  console.log("Checking permission for", role, action, resource);

  if (!ac) {
    throw new Error("AccessControl is not initialized.");
  }

  console.log("AccessControl", ac.getGrants());

  try {
    const permission = ac.permission({
      role,
      resource,
      action,
    });
    return permission.granted; // true or false
  } catch (error: any) {
    if (error.name === "AccessControlError") {
      console.error("AccessControlError:", error.message);
    } else {
      console.error("Unexpected error:", error.message);
    }
  }

  return false;
}

export async function checkPermissionMultirole(
  roles: string[],
  action: string,
  resource: string
): Promise<boolean> {
  if (!roles.length) {
    return false;
  }

  await initAcl();
  const ac = await loadAccessControl();

  if (!ac) {
    throw new Error("AccessControl is not initialized.");
  }

  for (const role of roles) {
    try {
      const permission = ac.permission({
        role,
        resource,
        action,
      });

      if (permission.granted) {
        return true;
      }
    } catch (error: any) {
      if (error.name === "AccessControlError") {
        console.error("AccessControlError:", error.message);
      } else {
        console.error("Unexpected error:", error.message);
      }
    }
  }

  return false;
}

export async function initAcl() {
  try {
    const isAclLoaded = await isAccessControlLoaded();
    if (!isAclLoaded) {
      console.log("AccessControl is not loaded. Initializing...");
      await initializeAccessControl();
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize AccessControl:", error);
    return false;
  }
}

// Function to get combined permissions for multiple roles
// Function to get combined permissions for multiple roles
export async function getPermissionsForRoles(
  roles: string[]
): Promise<Permissions> {
  await initAcl();
  const ac = await loadAccessControl();

  if (!ac) {
    throw new Error("AccessControl is not initialized.");
  }

  const grants = ac.getGrants();
  const combinedPermissions: Permissions = {};

  roles.forEach((role) => {
    const rolePermissions = grants[role];
    if (rolePermissions) {
      for (const [resource, actions] of Object.entries(rolePermissions)) {
        if (!combinedPermissions[resource]) {
          combinedPermissions[resource] = {};
        }
        // Merge actions for the resource
        for (const [action, attributes] of Object.entries(
          actions as { [key: string]: string[] }
        )) {
          combinedPermissions[resource][action] = Array.from(
            new Set([
              ...(combinedPermissions[resource][action] || []),
              ...attributes,
            ])
          ); // Ensure unique attributes
        }
      }
    }
  });

  return combinedPermissions;
}
