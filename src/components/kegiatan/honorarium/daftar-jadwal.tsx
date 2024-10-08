"use client";

import { getOptionsSbmHonorarium, OptionSbm } from "@/actions/sbm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getJadwalByKegiatanId, JadwalKelasNarasumber } from "@/data/jadwal";
import { formatHariTanggal } from "@/utils/date-format";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";
import NarasumberListItem from "./narasumber-list-item";

export type Proses = "pengajuan" | "verfikasi" | "pembayaran";
interface DaftarJadwalProps {
  kegiatanId: string;
  proses: Proses;
}
const DaftarJadwal = ({ kegiatanId, proses }: DaftarJadwalProps) => {
  const [dataJadwal, setDataJadwal] = useState<JadwalKelasNarasumber[]>([]);
  useEffect(() => {
    const getJadwal = async () => {
      const dataJadwal = await getJadwalByKegiatanId(kegiatanId);
      setDataJadwal(dataJadwal);
    };
    getJadwal();
  }, [kegiatanId]);

  const [optionsSbmHonorarium, setOptionsSbmHonorarium] = useState<OptionSbm[]>(
    []
  );

  useEffect(() => {
    const fetchOptionsSbmHonorarium = async () => {
      const optionsSbm = await getOptionsSbmHonorarium();

      const convertedData = optionsSbm.map((item) => ({
        ...item,
        besaran: new Decimal(item.besaran ?? 0), // Convert to Decimal
      }));

      if (optionsSbm) {
        setOptionsSbmHonorarium(convertedData);
      }
    };
    fetchOptionsSbmHonorarium();
  }, []);

  // dataJadwal merupakan array of Jadwal (kelas, materi,  jadwalNarasumber[])
  // asumsinya setiap kegiatan dapat memiliki lebih dari 1 jadwal (kelas, materi, narasumber)
  // pengajuan honorarium narasumber dilakukan per jadwal, karena perkelas bisa memiliki narasumber yang berbeda maka terdapat jadwalNarasumber[] yang masing masing berisi data narasumber dan besaran honorarium bisa berbeda secara manual ditentukan oleh user dengan memilih dari dropdown sbm jenis honorarium dan JP nya

  // pengajuan dilakukan per-jadwal , sehingga tidak bisa masing-masing narasumber diproses terpisah
  // karena pengajuan dilakukan per-jadwal, maka log status di tulis di jadwal, bukan di jadwalNarasumber

  return (
    <div className="flex flex-col gap-6">
      {dataJadwal &&
        dataJadwal.map((jadwal, index) => {
          return (
            <div
              key={index}
              className="w-full border border-gray-300 focus-within:ring-1 focus-within:ring-blue-500 rounded-md"
            >
              <div className="flex flex-row w-full ">
                <div className="px-4 w-1/3 py-2  border-b border-gray-300">
                  {jadwal.kelas.nama}
                </div>
                <div className="px-4 py-2 w-full border-b border-gray-300">
                  {jadwal.materi.nama}
                </div>
                <div className="px-4 py-2 w-full border-b border-gray-300">
                  {formatHariTanggal(jadwal.tanggal)}
                </div>
              </div>

              <div className="flex flex-col w-full px-4 py-2">
                {jadwal.jadwalNarasumber.map((jadwalNarsum, index) => {
                  const jumlahNarsum = jadwal.jadwalNarasumber.length;
                  return (
                    <NarasumberListItem
                      key={index}
                      optionsSbmHonorarium={optionsSbmHonorarium}
                      index={index}
                      jadwal={jadwalNarsum}
                      totalNarsum={jumlahNarsum}
                    />
                  );
                })}
              </div>

              <div className="flex flex-col w-full ">
                <div className="px-4 py-2 w-full border-t border-gray-300">
                  <div className="flex flex-row justify-between">
                    <div className="text-gray-500">Total</div>
                    <div className="text-gray-500">Rp. 1.000.000</div>
                  </div>
                </div>
                <div className="px-4 py-2 w-full border-t border-gray-300">
                  <div className="flex flex-row justify-between">
                    <div className="text-gray-500">Status</div>
                    <div className="text-gray-500">
                      Revisi/Disetujui/Dibayar
                    </div>
                  </div>
                </div>
                {proses == "pengajuan" && <FormProsesPengajuan />}
                {proses == "verfikasi" && <FormProsesVerifikasi />}
              </div>
            </div>
          );
        })}
    </div>
  );
};

const FormProsesPengajuan = () => {
  return (
    <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
      <div>
        <Textarea placeholder="Catatan" className="w-full" />
      </div>
      <div className="flex flex-row justify-between">
        <Button className="bg-blue-500 text-white">Ajukan</Button>
      </div>
    </div>
  );
};

const FormProsesVerifikasi = () => {
  return (
    <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
      <div>
        <Textarea
          placeholder="Catatan"
          className="w-full focus:border-none focus-visible:outline-none focus-visible:ring-blue-300 focus-visible:ring-1  focus-visible:ring-offset-1"
        />
      </div>
      <div className="flex flex-row gap-2 justify-between">
        <Button className="bg-red-500 text-white hover:bg-red-600">
          Revisi
        </Button>
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          Setuju
        </Button>
      </div>
    </div>
  );
};

export default DaftarJadwal;
