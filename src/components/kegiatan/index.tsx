"use client";
import { KegiatanWithDetail } from "@/actions/kegiatan";
import { LOKASI } from "@prisma-honorarium/client";
//import { Kegiatan } from "@/zod/schemas/kegiatan";
import { mapStatusLangkahToDesc } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import TextDokumenMultiFile from "./text-dokumen-multi-file";
import TextDokumenWithPreviewButton from "./text-dokumen-with-preview-button";
import TextWithPreviewButton from "./text-with-preview-button";

interface PreviewKegiatanProps {
  kegiatan?: KegiatanWithDetail | null;
  className?: string;
}
const PreviewKegiatan = ({ kegiatan, className }: PreviewKegiatanProps) => {
  if (!kegiatan) {
    return (
      <div className="flex flex-row gap-2 w-full mt-2 p-4 border border-gray-300 rounded-sm animate-pulse">
        <span>
          Belum ada kegiatan yang dipilih. Silahkan pilih kegiatan untuk melihat
          detailnya.
        </span>
      </div>
    );
  }

  const dokumenKegiatan = kegiatan.dokumenKegiatan;
  const dokumenSuratTugas = dokumenKegiatan?.filter(
    (dokumen) => dokumen.jenisDokumenId === "surat-tugas"
  );

  const dokumenNodinMemoSk = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "nodin-memo-sk"
  );

  const dokumenJadwal = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "jadwal-kegiatan"
  );

  const pengajuanRampungan = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "GENERATE_RAMPUNGAN"
  );
  const pengajuanUhDalamNegeri = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "UH_DALAM_NEGERI"
  );
  const pengajuanUhLuarNegeri = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "UH_LUAR_NEGERI"
  );

  const pengajuanHonorarium = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "HONORARIUM"
  );

  return (
    <div className={cn("rounded-sm", className)}>
      {!kegiatan && <>Loading detail kegiatan...</>}
      {kegiatan && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col">
            <label className="text-gray-700">Nama Kegiatan</label>
            <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
              {kegiatan.nama}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full  ">
            <div className="flex flex-col w-full sm:w-1/3">
              <label className="text-gray-700">Tanggal Mulai</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {format(new Date(kegiatan.tanggalMulai), "yyyy-MM-dd")}
              </span>
            </div>
            <div className="flex flex-col w-full sm:w-1/3 ">
              <label className="text-gray-700">Tanggal Selesai</label>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1  w-full">
                {format(new Date(kegiatan.tanggalSelesai), "yyyy-MM-dd")}
              </span>
            </div>
          </div>

          <TextDokumenWithPreviewButton
            label="Dokumen Nodin/Memo/SK"
            dokumen={dokumenNodinMemoSk}
          />

          <TextDokumenWithPreviewButton
            label="Dokumen Jadwal Kegiatan"
            dokumen={dokumenJadwal}
          />

          <TextDokumenMultiFile
            label="Dokumen Surat Tugas (multiple files)"
            dokumen={dokumenSuratTugas || []}
          />

          <div className="flex flex-col">
            <span className="text-gray-700">Lokasi</span>
            <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
              {kegiatan.lokasi}
            </span>
          </div>

          {kegiatan.lokasi == LOKASI.LUAR_KOTA && (
            <div className="flex flex-col">
              <span className="text-gray-700">Lokasi</span>
              <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
                {kegiatan.lokasi}
              </span>
            </div>
          )}

          {pengajuanRampungan && (
            <RowText
              label="Status Rampungan"
              value={mapStatusLangkahToDesc(pengajuanRampungan.status)}
            />
          )}

          {kegiatan.spd?.id && (
            <TextWithPreviewButton
              label="SPD"
              fileName={kegiatan.spd?.nomorSPD}
              url={`/download/dokumen-rampungan/${kegiatan.id}`}
            />
          )}

          {pengajuanUhLuarNegeri && (
            <RowText
              label="Status UH Luar Negeri"
              value={mapStatusLangkahToDesc(pengajuanUhLuarNegeri.status)}
            />
          )}

          {pengajuanUhDalamNegeri && (
            <RowText
              label="Status UH Dalam Negeri"
              value={mapStatusLangkahToDesc(pengajuanUhDalamNegeri.status)}
            />
          )}
        </div>
      )}
    </div>
  );
};

interface RowTextProps {
  label: string;
  value: string;
}
const RowText = ({ label, value }: RowTextProps) => (
  <div className="flex flex-col">
    <span className="text-gray-700">{label}</span>
    <span className=" bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
      {value}
    </span>
  </div>
);

export default PreviewKegiatan;
