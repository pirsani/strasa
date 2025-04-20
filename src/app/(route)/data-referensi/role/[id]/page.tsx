import { checkSessionPermission } from "@/actions/pengguna/session";
import {
  getAllPermissions,
  getPermissionsOfRole,
} from "@/data/rbac/permission/permission";
import { getListOfResource, getRole } from "@/data/rbac/role/role";
import { Role as ZRole } from "@/zod/schemas/role";
import Link from "next/link";
import FormPermissions from "./form-permission";

const RoleDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const listOfResource = await getListOfResource();
  // console.log("listOfResource", listOfResource);

  const hasPermission = await checkSessionPermission({
    actions: "create:any",
    resource: "ref-role",
  });
  if (!hasPermission) {
    return <div>Unauthorized</div>;
  }
  const role = await getRole(id);

  let zrole: ZRole = {
    name: "",
    permissions: [],
  };

  if (!role && id !== "new") {
    return <div>Role not found</div>;
  } else if (role) {
    const permissions = await getPermissionsOfRole(id);
    zrole = {
      id: role.id,
      name: role.name,
      permissions: permissions,
    };
  }

  const availablePermissions = await getAllPermissions();
  // console.log("availablePermissions", availablePermissions);

  return (
    <div className="h-full flex flex-col gap-2 p-4 rounded-md">
      <h1 className="font-semibold">
        <Link
          href="/data-referensi/role"
          className="hover:underline text-blue-500"
        >
          Role
        </Link>{" "}
        - {role?.name || "New Role"}{" "}
      </h1>
      <FormPermissions
        resources={listOfResource.map((resource) => resource.resource)}
        availablePermissions={availablePermissions}
        role={zrole}
      />
    </div>
  );
};

export default RoleDetailPage;
