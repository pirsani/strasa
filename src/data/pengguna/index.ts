import { dbHonorarium } from "@/lib/db-honorarium";
import {
  Organisasi,
  User as Pengguna,
  Permission,
  Role,
  RolePermission,
  UserRole,
} from "@prisma-honorarium/client";

export interface PenggunaInfo {
  id: string;
  name: string;
  email: string;
  organisasiId?: string | null;
}

export interface RolePermissionWithPermission extends RolePermission {
  permission: Permission;
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermissionWithPermission[];
}

export interface UserRoleWithRole extends UserRole {
  role: RoleWithPermissions;
}

export interface OrganisasiWithInduk extends Organisasi {
  indukOrganisasi?: Organisasi | null;
}

export interface ProfilePengguna extends Omit<Pengguna, "password"> {
  userRole?: UserRoleWithRole[] | null;
  organisasi?: OrganisasiWithInduk | null;
}

export const getProfile = async (
  id: string
): Promise<ProfilePengguna | null> => {
  const dataPengguna = await dbHonorarium.user.findUnique({
    where: {
      id: id,
    },
    include: {
      userRole: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
      organisasi: {
        include: {
          indukOrganisasi: true,
        },
      },
    },
  });
  return dataPengguna;
};
