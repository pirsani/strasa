"use server";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import { getPrismaErrorResponse } from "@/actions/prisma-error-response";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { initializeAccessControl } from "@/lib/redis/access-control";
import { Role as ZRole } from "@/zod/schemas/role";
import { createId } from "@paralleldrive/cuid2";
import { Role } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { Logger } from "tslog";
// Create a Logger instance with custom settings
const logger = new Logger({
  hideLogPositionForProduction: true,
});
// pada prinsipnya, Satker anggaran adalah unit kerja dalam organisasi yang memiliki anggaran

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}
export const getRoles = async (role?: string) => {
  const dataRole = await dbHonorarium.role.findMany({
    include: {
      permissions: true,
    },
  });
  //logger.info("dataRole", dataRole);
  return dataRole;
};

// hanya akan memberi flag isRole pada unit kerja yang dipilih

export const deleteRole = async (id: string): Promise<ActionResponse<Role>> => {
  try {
    const deleted = await dbHonorarium.role.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/data-referensi/role");
    return {
      success: true,
      data: deleted,
    };
  } catch (error) {
    logger.error("Error deleting role:", error);
    return getPrismaErrorResponse(error as Error);
  }
};

export const getOptionsRole = async () => {
  const dataRole = await dbHonorarium.role.findMany({});
  // map dataRole to options
  const optionsRole = dataRole.map((role) => {
    const label = role.name;
    return {
      label: label,
      value: role.id,
    };
  });

  return optionsRole;
};

export const simpanRole = async (
  data: ZRole
): Promise<ActionResponse<Role>> => {
  // check permission
  try {
    const hasPermission = await checkSessionPermission({
      actions: "create:any",
      resource: "ref-role",
    });

    const user = await getLoggedInPengguna();

    if (!hasPermission || !user) {
      return {
        success: false,
        error: "Unauthorized",
        message: "Unauthorized",
      };
    }

    const { permissionsToRemove, permissionsToAdd } = await diffPermissions(
      data.id || createId(),
      data.permissions || []
    );

    // check if role already exists
    const existingrole = await dbHonorarium.role.findUnique({
      where: {
        id: data.id || createId(),
      },
    });

    // update role with transaction
    const trans = await dbHonorarium.$transaction(async (prisma) => {
      let role: Role | null = existingrole;
      if (role === null) {
        role = await prisma.role.create({
          data: {
            name: data.name,
            createdBy: user.id!, // user.id is not null
          },
        });
      } else {
        // delete permissions
        console.log(
          "delete permissions",
          permissionsToRemove.map((p) => p)
        );
        const deleted = await prisma.rolePermission.deleteMany({
          where: {
            roleId: role.id,
            permissionId: {
              in: permissionsToRemove.map((p) => p),
            },
          },
        });
        console.log("deleted", deleted);

        // add permissions
        const added = await prisma.rolePermission.createMany({
          data: permissionsToAdd.map((p) => ({
            roleId: role?.id!, // role?.id is not null
            permissionId: p,
          })),
        });
        console.log("added", added);
      }
      return role;
    });

    // apply roles to redis access control and reinitialize
    await initializeAccessControl();

    revalidatePath("/data-referensi/role");
    revalidatePath("/data-referensi/role/" + data.id);

    return {
      success: true,
      message: "Role saved successfully",
      data: trans,
    };

    // update permissions
  } catch (error) {
    console.error("Error checking permission:", error);
    return {
      success: false,
      error: "Error ESR-001",
      message: "Please try again or contact support",
    };
  }
};

const diffPermissions = async (roleId: string, newPermissions: string[]) => {
  // console.log("diffPermissions", roleId, newPermissions);
  // newPermissions is an array of strings representing action e.g. ["create:any", "read:own"] and resource e.g. "ref-role"
  // become "create:any:ref-role", "read:own:ref-role"
  const rolePermissions = await dbHonorarium.rolePermission.findMany({
    where: {
      roleId: roleId,
    },
    include: {
      permission: true,
    },
  });

  // map newPermissions to permissionsId

  const permissions = await dbHonorarium.permission.findMany();

  // map newPermissions to permissionsId
  const newPermissionIds = newPermissions
    .map((permission) => {
      const [action, resource] = permission.split("::");
      const permissionId = permissions.find(
        (p) => p.action === action && p.resource === resource
      )?.id;
      return permissionId;
    })
    .filter((permissionId) => permissionId !== undefined);

  const existingPermissionsId = rolePermissions.map((permission) => {
    return permission.permissionId;
  });
  // find permissions that are in newPermissions but not in existingPermissions
  const permissionsToAdd = newPermissionIds.filter(
    (permissionId) => !existingPermissionsId.includes(permissionId)
  );
  // find permissions that are in existingPermissions but not in newPermissions
  const permissionsToRemove = existingPermissionsId.filter(
    (permissionId) => !newPermissionIds.includes(permissionId)
  );

  // console.log("newPermissionIds", newPermissionIds);
  // console.log("permissionsToAdd", permissionsToAdd);
  // console.log("permissionsToRemove", permissionsToRemove);
  return {
    newPermissionIds,
    permissionsToAdd,
    permissionsToRemove,
  };
};

interface RolePermission {
  permissionId: string;
  roleId?: string;
}
export const simpanDataRole = async (
  data: ZRole
): Promise<ActionResponse<Role>> => {
  try {
    const { permissions, ...roleWithoutPermission } = data;
    // create array permission object
    const objPermissions: RolePermission[] = (permissions ?? []).map(
      (p: string) => {
        const px: RolePermission = {
          permissionId: p,
        };
        return px;
      }
    );
    let permissionsToRemove: RolePermission[] = [];
    let permissionsToAdd: RolePermission[] = [];
    if (data.id) {
      // Fetch existing permissions
      const existingPermissions = await dbHonorarium.rolePermission.findMany({
        where: {
          roleId: data.id,
        },
      });
      // Determine permissions to add and remove
      const existingPermissionIds = new Set(
        existingPermissions.map((p) => p.roleId)
      );
      const newPermissionIds = new Set(
        objPermissions.map((p) => p.permissionId)
      );

      permissionsToAdd = objPermissions.filter(
        (p) => !existingPermissionIds.has(p.permissionId)
      );
      permissionsToRemove = existingPermissions.filter(
        (p) => !newPermissionIds.has(p.roleId)
      );
    }

    const roleBaru = await dbHonorarium.role.upsert({
      where: {
        id: data.id || createId(),
      },
      create: {
        ...roleWithoutPermission,
        createdBy: "admin",
        permissions: {
          createMany: {
            data: objPermissions,
          },
        },
      },
      update: {
        ...roleWithoutPermission,
        updatedBy: "admin",
        permissions: {
          deleteMany: {
            permissionId: {
              in: permissionsToRemove.map((p) => p.permissionId),
            },
          },
          createMany: {
            data: permissionsToAdd,
          },
        },
      },
    });

    // apply roles to redis access control and reinitialize
    await initializeAccessControl();

    revalidatePath("/data-referensi/role");
    return {
      success: true,
      data: roleBaru,
    };
  } catch (error) {
    logger.error("Error saving role:", error);
    return {
      success: false,
      error: "Not implemented",
      message: "Not implemented",
    };
  }
};
