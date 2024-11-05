"use client";

import TabelRiwayatPengajuanDetail from "@/components/kegiatan/riwayat-pengajuan/tabel-riwayat-pengajuan-detail";

interface RiwayatPengajuanProps {
  kegiatanId?: string | null;
}
const RiwayatPengajuan = ({ kegiatanId }: RiwayatPengajuanProps) => {
  return (
    <div className="bg-white p-2">
      <TabelRiwayatPengajuanDetail kegiatanId={kegiatanId || null} />
    </div>
  );
};

export default RiwayatPengajuan;
