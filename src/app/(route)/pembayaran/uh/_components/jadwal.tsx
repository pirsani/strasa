import { OptionSbm } from "@/actions/sbm";
import NarasumberListItem from "@/components/kegiatan/honorarium/narasumber-list-item";
import { ObjPlainJadwalKelasNarasumber } from "@/data/jadwal";
import { formatHariTanggal } from "@/utils/date-format";
import { ALUR_PROSES, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import DlNominatifHonorarium from "./dl-nominatif-honorarium";

interface JadwalProps {
  jadwal: ObjPlainJadwalKelasNarasumber;
  proses: ALUR_PROSES;
}
const Jadwal = ({ jadwal, proses }: JadwalProps & { proses: ALUR_PROSES }) => {
  const status = jadwal.riwayatPengajuan?.status || null;
  return (
    <div
      key={jadwal.id}
      className="w-full border border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-md"
    >
      <div className="flex flex-row w-full border-b border-blue-400 ">
        <div className="px-4 w-1/3 py-2  ">{jadwal.kelas.nama}</div>
        <div className="px-4 py-2 w-full">
          <span>{jadwal.materi.nama}</span>
          <span className="px-2">{`(${
            jadwal.jumlahJamPelajaran?.toString() || "0"
          }JP) `}</span>
        </div>
        <div className="px-4 py-2 w-full ">
          {formatHariTanggal(jadwal.tanggal)}
        </div>
        <div className="flex-grow" />
      </div>

      <div className="flex flex-col w-full px-4 py-2">
        {jadwal.jadwalNarasumber.map((jadwalNarasumber, index) => {
          const jumlahNarsum = jadwal.jadwalNarasumber.length;

          // destructuring jenisHonorarium
          const {
            uraian,
            id,
            besaran = new Decimal(0),
            satuan,
          } = jadwalNarasumber.jenisHonorarium || {};

          // set default value for optionsSbmHonorarium
          const optionsSbmHonorarium: OptionSbm[] = [
            {
              label: uraian ?? "-",
              value: id ?? "",
              besaran: besaran,
              satuan: satuan,
            },
          ];
          return (
            <NarasumberListItem
              key={jadwalNarasumber.id}
              optionsSbmHonorarium={optionsSbmHonorarium}
              index={index}
              jadwalNarasumber={jadwalNarasumber}
              totalNarsum={jumlahNarsum}
              proses={proses}
              statusPengajuanHonorarium={
                jadwal.riwayatPengajuan?.status as STATUS_PENGAJUAN
              }
            />
          );
        })}
      </div>

      <div className="flex flex-col w-full ">
        <div className="px-4 py-2 w-full border-t border-gray-300">
          Catatan: {jadwal.riwayatPengajuan?.catatanRevisi || "-"}
        </div>
      </div>
      <DlNominatifHonorarium status={status} jadwal={jadwal} />
    </div>
  );
};

export default Jadwal;
