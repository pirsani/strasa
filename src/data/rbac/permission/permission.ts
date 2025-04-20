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
  // concat action and resource by "::"
  return permissions.map(
    (permission) => `${permission.action}::${permission.resource}`
  );
};

export const getAllPermissions = async () => {
  const permissions = await dbHonorarium.permission.findMany();
  const permissionsArr = permissions.map((permission) => ({
    action: permission.action,
    resource: permission.resource,
  }));
  // concat action and resource by "::"
  return permissionsArr.map(
    (permission) => `${permission.action}::${permission.resource}`
  );
};
