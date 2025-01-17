import { getObjPlainJadwalById } from "@/data/jadwal";
import { JadwalKelasNarasumber } from "./_components/jadwal-kelas-narasumber";

export default async function HonorariumDetilPage({
  params,
}: {
  params: Promise<{ jadwalId: string }>;
}) {
  const jadwalId = (await params).jadwalId;
  const jadwal = await getObjPlainJadwalById(jadwalId);

  // check otorisasi

  if (!jadwal) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <JadwalKelasNarasumber jadwal={jadwal} proses="PENGAJUAN" />
      </div>
    </div>
  );
}
