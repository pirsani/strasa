import { getKro } from "@/actions/kro";
import { DialogTambahKro } from "./_components/dialog-tambah-kro";
import { TabelKro } from "./_components/tabel-kro";

const KroPage = async () => {
  const data = await getKro();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Kro </h1>
      <DialogTambahKro />
      <TabelKro data={data} />
    </div>
  );
};

export default KroPage;
