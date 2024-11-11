import { getKegiatan } from "@/actions/kegiatan";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getDistinctStatusPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import ContainerTabelWithFilterStatus from "./_components/container-tabel-with-filter-status";

const WorkbenchPage = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const kegiatan = await getKegiatan();
  const distinctStatus = await getDistinctStatusPengajuan(tahunAnggaran);

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-200/90">
      <h1 className="mb-2">Workbench </h1>
      <div className="flex-grow w-full border p-2 bg-gray-100 rounded-lg pb-24">
        <ContainerTabelWithFilterStatus
          status={distinctStatus || []}
          kegiatan={kegiatan}
        />
      </div>
    </div>
  );
};

export default WorkbenchPage;
