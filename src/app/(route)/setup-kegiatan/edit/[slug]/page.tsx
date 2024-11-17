import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import { KegiatanEditMode as ZKegiatan } from "@/zod/schemas/kegiatan"; // This is the Zod schema
import { createId } from "@paralleldrive/cuid2";
import SetupKegiatanEditContainer from "./_components/setup-kegiatan-edit-container";

const conformTo = <
  T extends Record<string, any>,
  U extends Record<string, any>
>(
  obj: T,
  template: U
): { [K in keyof U]: K extends keyof T ? T[K] : never } => {
  const result = {} as { [K in keyof U]: K extends keyof T ? T[K] : never };

  Object.keys(template).forEach((key) => {
    if (key in obj) {
      // Explicit casting ensures key compatibility
      result[key as keyof U] = obj[key as keyof T] as any;
    }
  });

  return result;
};

const SetupKegiatanPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const kegiatan = await getKegiatanWithAllDetailById(slug);

  if (!kegiatan) {
    return (
      <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
        <h1 className="mb-2">Alur Proses &gt; 0 Setup Kegiatan </h1>
        <div className="flex-grow w-full sm:px-10 xl:w-4/5 border py-4 bg-gray-100 rounded-lg pb-24">
          <div className="p-4">Kegiatan tidak ditemukan</div>
        </div>
      </div>
    );
  }

  const zkegiatan: ZKegiatan = {
    cuid: kegiatan.id,
    dokumenJadwalCuid: kegiatan.dokumenJadwal,
    dokumenNodinMemoSkCuid: kegiatan.dokumenNodinMemoSk,
    //dokumenSuratTugasCuid: [],
    nama: kegiatan.nama,
    tanggalMulai: kegiatan.tanggalMulai,
    tanggalSelesai: kegiatan.tanggalSelesai,
    lokasi: kegiatan.lokasi,
    provinsi: kegiatan.provinsiId,
    kota: kegiatan.kota,
    pesertaXlsxCuid: createId() + ".xlsx",
  };

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2">Alur Proses &gt; 0 Setup Kegiatan </h1>
      <div className="flex-grow w-full sm:px-10 xl:w-4/5 border py-4 bg-gray-100 rounded-lg pb-24">
        <SetupKegiatanEditContainer editId={slug} kegiatan={zkegiatan} />
      </div>
    </div>
  );
};

export default SetupKegiatanPage;
