import { ProfilePengguna } from "@/data/pengguna";
export const extractPermissionsFromProfilePengguna = (
  profilePengguna: ProfilePengguna
) => {
  const permissions: {
    resource: string;
    action: string;
  }[] = [];

  profilePengguna.userRole?.forEach((userRole) => {
    userRole.role.permissions.forEach((p) => {
      const permission = p.permission;
      permissions.push({
        resource: permission.resource,
        action: permission.action,
      });
    });
  });

  const uniquePermissions = Array.from(
    new Map(permissions.map((p) => [`${p.resource}-${p.action}`, p])).values()
  );

  return uniquePermissions;
};

export const extractRoleNamesFromProfilePengguna = (
  profilePengguna: ProfilePengguna
) => {
  const roleNames: string[] = [];
  profilePengguna.userRole?.forEach((userRole) => {
    const role = userRole.role;
    if (role && !roleNames.includes(role.name)) {
      roleNames.push(role.name);
    }
  });
  return roleNames;
};
