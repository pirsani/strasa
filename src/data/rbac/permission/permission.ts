import { dbHonorarium } from "@/lib/db-honorarium";

export const getPermissionsOfRole = async (role: string) => {
  const rolePermissions = await dbHonorarium.rolePermission.findMany({
    where: {
      roleId: role,
    },
    include: {
      permission: true,
    },
  });
  const permissions = rolePermissions.map((permission) => ({
    action: permission.permission.action,
    resource: permission.permission.resource,
  }));
  return permissions.map(
    (permission) => `${permission.action}:${permission.resource}`
  );
};
