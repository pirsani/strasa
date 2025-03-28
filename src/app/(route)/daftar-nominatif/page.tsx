import DaftarNominatifContainer from "./_components/daftar-nominatif-container";

const PengajuanPage = () => {
  //data daftar pengajuan sesuai tahun aktif dan unit kerjanya
  //jika ada satu saja pengajuan yang di ajukan, maka status kegiatan menjadi "SUBMITTED" sehingga bisa mulai muncul di proses verifikasi
  const dataKegiatan = [];
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2">Alur Proses &gt; 3. Daftar Nominatif </h1>
      <DaftarNominatifContainer />
    </div>
  );
};

export default PengajuanPage;
