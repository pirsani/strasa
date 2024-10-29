import PreviewKegiatan from "@/components/kegiatan";
import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import KegiatanDetailContainer from "./_components/kegiatan-detail-container";

const Kegiatan = async ({ params }: { params: { slug: string[] } }) => {
  const kegiatanId = params.slug[0];
  const kegiatan = await getKegiatanWithAllDetailById(kegiatanId);

  if (!kegiatan) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2"> Kegiatan </h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <PreviewKegiatan kegiatan={kegiatan} />
      </div>
      <KegiatanDetailContainer kegiatan={kegiatan} />
    </div>
  );
};

export default Kegiatan;
