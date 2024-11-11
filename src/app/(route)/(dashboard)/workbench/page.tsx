import { getKegiatan } from "@/actions/kegiatan";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getDistinctStatusPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import ContainerTabelWithFilterStatus from "./_components/container-tabel-with-filter-status";

const WorkbenchPage = async () => {
  const kegiatan = await getKegiatan();
  const tahunAnggaran = await getTahunAnggranPilihan();
  const distinctStatus = await getDistinctStatusPengajuan(tahunAnggaran);

  return (
    <div>
      <h1>Workbench Page</h1>
      <div>
        <ContainerTabelWithFilterStatus
          status={distinctStatus || []}
          kegiatan={kegiatan}
        />
      </div>
    </div>
  );
};

export default WorkbenchPage;
