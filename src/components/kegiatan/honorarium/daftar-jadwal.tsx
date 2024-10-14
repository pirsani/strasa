"use client";

import { deleteJadwalKelasNarasumber } from "@/actions/honorarium/narasumber/narasumber";
import updateStatusPengajuanPembayaran from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import { getOptionsSbmHonorarium, OptionSbm } from "@/actions/sbm";
import ConfirmDialog from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getObPlainJadwalByKegiatanId,
  ObjPlainJadwalKelasNarasumber,
} from "@/data/jadwal";
import { useSearchTerm } from "@/hooks/use-search-term";
import { StatusLangkah } from "@/lib/constants";
import { formatHariTanggal } from "@/utils/date-format";
import Decimal from "decimal.js";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import StatusBadge from "../status-badge";
import NarasumberListItem from "./narasumber-list-item";

export type Proses = "pengajuan" | "verfikasi" | "pembayaran";
interface DaftarJadwalProps {
  kegiatanId: string;
  proses: Proses;
  triggerUpdate?: number;
}
const DaftarJadwal = ({
  kegiatanId,
  proses,
  triggerUpdate, // hanya simple trigger untuk re-render
}: DaftarJadwalProps) => {
  const [selfTrigger, setSelfTrigger] = useState<number>(0);
  const [dataJadwal, setDataJadwal] = useState<ObjPlainJadwalKelasNarasumber[]>(
    []
  );
  const [isConfirmDialogDeleteJadwalOpen, setIsConfirmDialogDeleteJadwalOpen] =
    useState(false);
  const { searchTerm } = useSearchTerm();
  const sortedDataJadwal = dataJadwal.sort((obj1, obj2) => {
    const date1 = new Date(obj1.tanggal);
    const date2 = new Date(obj2.tanggal);
    return date1.getTime() - date2.getTime();
  });
  const filteredData = sortedDataJadwal.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.materi.nama?.toLowerCase().includes(word) ||
        row.jadwalNarasumber.some((narsum) =>
          narsum.narasumber.nama?.toLowerCase().includes(word)
        )
    );
  });

  useEffect(() => {
    const getJadwal = async () => {
      const dataJadwal = await getObPlainJadwalByKegiatanId(kegiatanId);
      //const dataJadwal = await getJadwalByKegiatanId(kegiatanId);
      setDataJadwal(dataJadwal);
    };
    getJadwal();
  }, [kegiatanId, triggerUpdate, selfTrigger]);

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

  const handleCancel = () => {
    setIsConfirmDialogDeleteJadwalOpen(false);
    console.log("Cancelled!");
  };

  const handleConfirmDeleteJadwal = async () => {
    if (!originalJadwal) return;
    const deleteJadwal = await deleteJadwalKelasNarasumber(originalJadwal?.id);
    if (!deleteJadwal.success) {
      toast.error("Gagal menghapus jadwal");
      return;
    }
    setSelfTrigger((prev) => prev + 1);
    // setDataJadwal(
    //   dataJadwal.filter((jadwal) => jadwal.id !== originalJadwal?.id)
    // );
    setIsConfirmDialogDeleteJadwalOpen(false);
  };

  const [originalJadwal, setOriginalJadwal] =
    useState<ObjPlainJadwalKelasNarasumber | null>(null);
  const [
    confirmDialogDeleteJadwalMessage,
    setConfirmDialogDeleteJadwalMessage,
  ] = useState<string>("");

  const handleDeleteJadwal = async (jadwal: ObjPlainJadwalKelasNarasumber) => {
    setOriginalJadwal(jadwal);
    setConfirmDialogDeleteJadwalMessage(
      `Apakah anda yakin menghapus data jadwal tanggal ${originalJadwal?.tanggal}${originalJadwal?.kelas.nama} ${originalJadwal?.materi.nama}  ?`
    );
    // remove from dataJadwal after success delete
    setIsConfirmDialogDeleteJadwalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {filteredData &&
        filteredData.map((jadwal, index) => {
          const status = jadwal.statusPengajuanHonorarium;
          const isShowButton =
            status === "Draft" || status === "Revise" || status === null;
          if (proses == "verfikasi" && !status) {
            return null;
          } // skip jadwal yang belum diajukan
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

                {isShowButton && proses === "pengajuan" && (
                  <div className="p-2 border-b ">
                    <Button
                      className=""
                      variant={"destructive"}
                      type="button"
                      onClick={() => handleDeleteJadwal(jadwal)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col w-full px-4 py-2">
                {jadwal.jadwalNarasumber.map((jadwalNarsum, index) => {
                  const jumlahNarsum = jadwal.jadwalNarasumber.length;
                  return (
                    <NarasumberListItem
                      key={jadwalNarsum.id}
                      optionsSbmHonorarium={optionsSbmHonorarium}
                      index={index}
                      jadwal={jadwalNarsum}
                      totalNarsum={jumlahNarsum}
                      proses={proses}
                    />
                  );
                })}
              </div>

              <div className="flex flex-col w-full ">
                <div className="px-4 py-2 w-full border-t border-gray-300">
                  Catatan: {jadwal.catatanRevisi || "-"}
                </div>
                {proses == "pengajuan" && (
                  <FormProsesPengajuan
                    jadwalId={jadwal.id}
                    statusPengajuanHonorarium={jadwal.statusPengajuanHonorarium}
                  />
                )}
                {proses == "verfikasi" && (
                  <FormProsesVerifikasi
                    jadwalId={jadwal.id}
                    statusPengajuanHonorarium={jadwal.statusPengajuanHonorarium}
                  />
                )}
              </div>
              <ConfirmDialog
                message={confirmDialogDeleteJadwalMessage}
                isOpen={isConfirmDialogDeleteJadwalOpen}
                onConfirm={handleConfirmDeleteJadwal}
                onCancel={handleCancel}
              />
            </div>
          );
        })}
    </div>
  );
};

const handleProsesPengajuan = async (jadwalId: string) => {
  const newStatus: StatusLangkah = "Submitted";
  const updateStatus = await updateStatusPengajuanPembayaran(
    jadwalId,
    newStatus
  );
  if (updateStatus.success) {
    toast.success("Pengajuan berhasil diajukan");
  } else {
    toast.error(`Pengajuan gagal diajukan : ${updateStatus.message}`);
  }
  return updateStatus;
};

interface FormProsesPengajuanProps {
  jadwalId: string;
  statusPengajuanHonorarium: string | null;
}
const FormProsesPengajuan = ({
  jadwalId,
  statusPengajuanHonorarium,
}: FormProsesPengajuanProps) => {
  const [status, setStatus] = useState<string | null>(
    statusPengajuanHonorarium
  );

  const handleOnClick = async () => {
    const proses = await handleProsesPengajuan(jadwalId);
    if (proses.success) {
      setStatus("Submitted");
    }
  };

  const isShowButton =
    status === "Draft" || status === "Revise" || status === null;

  return (
    <>
      <div className="px-4 py-2 w-full border-t border-gray-300">
        <div className="flex flex-row justify-between">
          <div className="text-gray-500">Status</div>
          <StatusBadge status={status} />
        </div>
      </div>
      {isShowButton && (
        <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
          <div className="flex flex-row justify-between">
            <Button className="" type="button" onClick={handleOnClick}>
              Ajukan
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const handleProsesVerifikasiSetuju = async (jadwalId: string) => {
  console.log(jadwalId);
  const newStatus: StatusLangkah = "Approved";
  const updateStatus = await updateStatusPengajuanPembayaran(
    jadwalId,
    newStatus
  );
  if (updateStatus.success) {
    toast.success("Pengajuan berhasil diajukan");
  } else {
    toast.error(`Pengajuan gagal diajukan : ${updateStatus.message}`);
  }
  return updateStatus;
};

const handleProsesVerifikasiRevisi = async (
  jadwalId: string,
  catatan: string
) => {
  const newStatus: StatusLangkah = "Revise";
  const updateStatus = await updateStatusPengajuanPembayaran(
    jadwalId,
    newStatus,
    catatan
  );
  if (updateStatus.success) {
    toast.success("Pengajuan dikembalikan untuk perbaikan/revisi");
  } else {
    toast.error(`Error : ${updateStatus.message}`);
  }
  return updateStatus;
};

interface FormProsesVerifikasiProps {
  jadwalId: string;
  statusPengajuanHonorarium: string | null;
}
const FormProsesVerifikasi = ({
  jadwalId,
  statusPengajuanHonorarium,
}: FormProsesVerifikasiProps) => {
  const [status, setStatus] = useState<string | null>(
    statusPengajuanHonorarium
  );
  const [catatan, setCatatan] = useState<string>("");
  const handleOnClickSetuju = async () => {
    const proses = await handleProsesVerifikasiSetuju(jadwalId);
    if (proses.success) {
      setStatus(proses.data);
    }
  };

  const handleOnClickRevisi = async (catatan: string) => {
    const proses = await handleProsesVerifikasiRevisi(jadwalId, catatan);
    if (proses.success) {
      setStatus(proses.data);
    }
  };

  const isShowButton = status === "Submitted" || status === "Revised";

  return (
    <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
      <div className="px-4 py-2 w-full border-t border-gray-300">
        <div className="flex flex-row justify-between">
          <div className="text-gray-500">Status</div>
          <StatusBadge status={status} />
        </div>
      </div>
      {isShowButton && (
        <>
          <div>
            <Textarea
              placeholder="Catatan"
              className="w-full focus:border-none focus-visible:outline-none focus-visible:ring-blue-300 focus-visible:ring-1  focus-visible:ring-offset-1"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-2 justify-between">
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              type="button"
              onClick={() => handleOnClickRevisi(catatan)}
            >
              Revisi
            </Button>
            <Button
              className="bg-blue-500 text-white hover:bg-blue-600"
              type="button"
              onClick={handleOnClickSetuju}
            >
              Setuju
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DaftarJadwal;
