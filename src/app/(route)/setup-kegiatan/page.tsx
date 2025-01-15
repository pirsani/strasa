import { Suspense } from "react";
import SetupKegiatanContainer from "./_components/setup-kegiatan-container";

const SetupKegiatanPage = () => {
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2">Alur Proses &gt; 0 Setup Kegiatan </h1>
      <div className="flex-grow w-full sm:px-10 xl:w-4/5 border py-4 bg-gray-100 rounded-lg pb-24">
        <Suspense fallback={<div>Loading...</div>}>
          <SetupKegiatanContainer />
        </Suspense>
      </div>
    </div>
  );
};

export default SetupKegiatanPage;
