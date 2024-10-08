import { getRoles } from "@/actions/role";
import UnitKerjaContainer from "./_components/role-container";

const ReferensiUnitKerjaPage = async () => {
  const data = await getRoles();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Unit Kerja </h1>
      <UnitKerjaContainer data={data} />
    </div>
  );
};

export default ReferensiUnitKerjaPage;
