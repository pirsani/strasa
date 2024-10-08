import { getProvinsi } from "@/actions/provinsi";
import { DialogTambahProvinsi } from "./_components/dialog-tambah-provinsi";
import { TabelProvinsi } from "./_components/tabel-provinsi";

const ProvinsiPage = async () => {
  const data = await getProvinsi();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Provinsi </h1>
      <DialogTambahProvinsi />
      <TabelProvinsi data={data} />
    </div>
  );
};

export default ProvinsiPage;
