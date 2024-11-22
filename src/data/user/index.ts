"use server";
import { dbHonorarium } from "@/lib/db-honorarium";

export const getUser = async (email?: string) => {
  const user = await dbHonorarium.user.findFirst({
    where: {
      email: email,
    },
    include: {
      organisasi: true,
    },
  });
  return user;
};

interface Permission {
  name: string;
}

export async function getUserPermissions(userId: string) {
  const permissions = await dbHonorarium.$queryRaw<Permission[]>`
    SELECT p.name
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN roles r ON rp.role_id = r.id
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ${userId}
  `;

  const arrPermission = permissions.map((p) => p.name);
  return arrPermission;
}

export async function hasPermission(userId: string, permission: string) {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

export const getUserRoles = async (userId: string): Promise<string[]> => {
  const roles = await dbHonorarium.$queryRaw<{ name: string }[]>`
    SELECT r.name
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ${userId}
  `;

  const arrRoles = roles.map((r) => r.name);
  return arrRoles;
};
