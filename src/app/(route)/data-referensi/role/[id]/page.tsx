import { checkSessionPermission } from "@/actions/pengguna/session";
import { getPermissionsOfRole } from "@/data/rbac/permission/permission";
import { getListOfResource, getRole } from "@/data/rbac/role/role";
import FormPermissions from "./form-permission";

const RoleDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const listOfResource = await getListOfResource();
  console.log("listOfResource", listOfResource);

  const hasPermission = await checkSessionPermission({
    actions: "create:any",
    resource: "ref-role",
  });
  if (!hasPermission) {
    return <div>Unauthorized</div>;
  }
  const role = await getRole(id);

  if (!role && id !== "new") {
    return <div>Role not found</div>;
  }

  const permissions = await getPermissionsOfRole(id);
  console.log("list of permissions", permissions);

  return (
    <div className="h-full flex flex-col gap-2 p-4 rounded-md">
      <h1 className="font-semibold">
        Role Detail - {role?.name || "New Role"}{" "}
      </h1>
      <div className="">
        <FormPermissions
          resources={listOfResource.map((resource) => resource.resource)}
          permissions={permissions}
        />
      </div>
    </div>
  );
};

export default RoleDetailPage;
