import { getKegiatan } from "@/actions/kegiatan";
import TabelKegiatan from "./_components/tabel-kegiatan";

const WorkbenchPage = async () => {
  const kegiatan = await getKegiatan();
  return (
    <div>
      <h1>Workbench Page</h1>
      <div>
        <TabelKegiatan data={kegiatan} />
      </div>
    </div>
  );
};

export default WorkbenchPage;
