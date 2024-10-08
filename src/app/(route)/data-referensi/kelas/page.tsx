import { getKegiatan, getOptionsKegiatan } from "@/actions/kegiatan";
import { getKelas } from "@/actions/kelas";
import { get } from "lodash";
import { DialogTambahKelas } from "./_components/dialog-tambah-kelas";
import FormKelas from "./_components/form-kelas";
import { TabelKelas } from "./_components/tabel-kelas";

const KelasPage = async () => {
  const data = await getKelas();
  const optionsKegiatan = await getOptionsKegiatan();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Kelas </h1>
      <DialogTambahKelas />
      <TabelKelas data={data} optionsKegiatan={optionsKegiatan} />
    </div>
  );
};

export default KelasPage;
