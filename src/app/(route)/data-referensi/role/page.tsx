import { checkSessionPermission } from "@/actions/pengguna/session";
import { getRoles } from "@/actions/role";
import RoleContainer from "./_components/role-container";

const ReferensiUnitKerjaPage = async () => {
  const data = await getRoles();

  const hasPermission = await checkSessionPermission({
    actions: "create:any",
    resource: "ref-role",
  });

  console.log("Has permission?", hasPermission);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Unit Kerja </h1>
      <RoleContainer data={data} />
    </div>
  );
};

export default ReferensiUnitKerjaPage;
