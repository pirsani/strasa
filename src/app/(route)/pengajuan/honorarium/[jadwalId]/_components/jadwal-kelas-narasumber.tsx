"use client";
import { deleteJadwalKelasNarasumber } from "@/actions/honorarium/narasumber/jadwal-kelas-narasumber";
import updateStatusPengajuanPembayaran from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import { OptionSbm, PlainObjectOptionSbm } from "@/actions/sbm";
import ButtonEye from "@/components/button-eye-open-document";
import ConfirmDialog from "@/components/confirm-dialog";
import FormNominatif from "@/components/form/form-nominatif";
import NarasumberListItem from "@/components/kegiatan/honorarium/narasumber-list-item";
import StatusBadge from "@/components/kegiatan/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ObjPlainJadwalKelasNarasumber } from "@/data/jadwal";
import { getStatusPengajuan } from "@/lib/constants";
import { formatHariTanggal } from "@/utils/date-format";
import { NominatifPembayaranWithoutFile } from "@/zod/schemas/nominatif-pembayaran";
import {
  ALUR_PROSES,
  JENIS_PENGAJUAN,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DialogTambahNarasumberJadwal from "./dialog-tambah-narasumber-jadwal";

interface JadwalKelasNarasumberProps {
  jadwal: ObjPlainJadwalKelasNarasumber;
  proses?: ALUR_PROSES | null;
  optionsSbmHonorarium: PlainObjectOptionSbm[];
}
export const JadwalKelasNarasumber = ({
  jadwal,
  proses,
  optionsSbmHonorarium: initOptionsSbmHonorarium,
}: JadwalKelasNarasumberProps) => {
  const status = jadwal.riwayatPengajuan?.status || null;
  const [isClient, setIsClient] = useState(false);

  const [
    confirmDialogDeleteJadwalMessage,
    setConfirmDialogDeleteJadwalMessage,
  ] = useState<string>("");
  const [isConfirmDialogDeleteJadwalOpen, setIsConfirmDialogDeleteJadwalOpen] =
    useState(false);

  const [originalJadwal, setOriginalJadwal] =
    useState<ObjPlainJadwalKelasNarasumber | null>(null);

  const [dataJadwal, setDataJadwal] = useState<ObjPlainJadwalKelasNarasumber[]>(
    []
  );

  const handleDeleteJadwal = async (jadwal: ObjPlainJadwalKelasNarasumber) => {
    setOriginalJadwal(jadwal);
    setConfirmDialogDeleteJadwalMessage(
      `Hapus jadwal tanggal ${jadwal?.tanggal}${jadwal?.kelas.nama} ${jadwal?.materi.nama}  ?`
    );
    // hanya memunculkan dialog konfirmasi, delete dilakukan setelah confirm delete
    setIsConfirmDialogDeleteJadwalOpen(true);
  };

  const [optionsSbmHonorarium, setOptionsSbmHonorarium] = useState<OptionSbm[]>(
    []
  );

  const isStatusNullDraftRevise =
    status === "DRAFT" || status === "REVISE" || status === null;

  const convertOptionsSbmHonorarium = (options: PlainObjectOptionSbm[]) => {
    const convertedData: OptionSbm[] = options.map((item) => ({
      ...item,
      besaran: new Decimal(item.besaran ?? 0), // Convert to Decimal
    }));
    return convertedData;
  };

  useEffect(() => {
    setIsClient(true);
    setOptionsSbmHonorarium(
      convertOptionsSbmHonorarium(initOptionsSbmHonorarium)
    );
  }, [initOptionsSbmHonorarium]);

  if (!isClient) return null;

  if (proses == "VERIFIKASI" && !status) {
    return null;
  } // skip jadwal yang belum diajukan

  const handleProsesPengajuanSuccess = (
    jadwalId: string,
    newStatus: STATUS_PENGAJUAN | string
  ) => {
    // refresh data
    // setSelfTrigger((prev) => prev + 1);
    // jika pake optimistic tidak perlu refresh data langsung update existing row
    // find data from jadwal , update status  dan update jadwal
    setDataJadwal(
      dataJadwal.map((jadwal) => {
        if (jadwal.id === jadwalId) {
          return {
            ...jadwal,
            statusPengajuanHonorarium: newStatus,
          };
        }
        return jadwal;
      })
    );
  };

  const handleProsesVerifikasiReviseSuccess = (
    jadwalId: string,
    newStatus: string | STATUS_PENGAJUAN | null,
    catatan: string
  ) => {
    if (!newStatus) return;
    // refresh data
    // setSelfTrigger((prev) => prev + 1);
    // jika pake optimistic tidak perlu refresh data langsung update existing row
    // find data from jadwal , update status  dan update jadwal
    setDataJadwal(
      dataJadwal.map((jadwal) => {
        if (jadwal.id === jadwalId) {
          return {
            ...jadwal,
            catatanRevisi: catatan,
            statusPengajuanHonorarium: newStatus,
          };
        }
        return jadwal;
      })
    );
  };

  const handleProsesVerifikasiApproveSuccess = (
    jadwalId: string,
    newStatus: string | STATUS_PENGAJUAN | null
  ) => {
    if (!newStatus) return;
    // handle here
    setDataJadwal(
      dataJadwal.map((jadwal) => {
        if (jadwal.id === jadwalId) {
          return {
            ...jadwal,
            statusPengajuanHonorarium: newStatus,
          };
        }
        return jadwal;
      })
    );
  };

  const handleConfirmDeleteJadwal = async () => {
    if (!originalJadwal) return;
    const deleteJadwal = await deleteJadwalKelasNarasumber(originalJadwal?.id);
    if (!deleteJadwal.success) {
      toast.error("Gagal menghapus jadwal");
      return;
    }
    // setSelfTrigger((prev) => prev + 1);
    // optimistic update data jadwal
    setDataJadwal(
      dataJadwal.filter((jadwal) => jadwal.id !== originalJadwal?.id)
    );
    setIsConfirmDialogDeleteJadwalOpen(false);
  };

  const handleCancel = () => {
    setIsConfirmDialogDeleteJadwalOpen(false);
    //console.log("Cancelled!");
  };

  return (
    <div
      key={jadwal.id}
      className="w-full border border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-md"
    >
      <div className="flex flex-col w-full border-b border-blue-400 ">
        <div className="flex flex-col sm:flex-row w-full">
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

          {isStatusNullDraftRevise && proses === "PENGAJUAN" && (
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
        <div className="w-full flex flex-row gap-2 justify-between p-2 border-t border-gray-200">
          <span>Undangan Narasumber</span>
          <PreviewUndanganNarsum jadwalId={jadwal.id} />
        </div>
        <div className="w-full flex flex-row gap-2 justify-between p-2 border-t border-gray-200">
          <span>Daftar Hadir</span>
          <PreviewDaftarHadir jadwalId={jadwal.id} />
        </div>
      </div>

      <div className="flex flex-col w-full px-4 py-2">
        <h3 className="font-semibold mb-2">Narasumber</h3>
        {jadwal.jadwalNarasumber.map((jadwalNarasumber, index) => {
          const jumlahNarsum = jadwal.jadwalNarasumber.length;
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
      {proses == "PENGAJUAN" && (
        <div className="flex justify-end w-full border-t border-gray-300">
          <DialogTambahNarasumberJadwal
            kegiatanId={jadwal.kegiatanId}
            jadwalId={jadwal.id}
            jumlahJamPelajaran={jadwal.jumlahJamPelajaran}
            optionsSbmHonorarium={optionsSbmHonorarium}
          />
        </div>
      )}

      <div className="flex flex-col w-full ">
        <div className="px-4 py-2 w-full border-t border-gray-300">
          Catatan: {jadwal.riwayatPengajuan?.catatanRevisi || "-"}
        </div>
        <div className="px-4 py-2 w-full border-t border-gray-300 flex justify-between">
          <span className="text-gray-500">Status</span>
          <StatusBadge status={status} />
        </div>
        {proses == "PENGAJUAN" && (
          <FormProsesPengajuan
            jadwalId={jadwal.id}
            statusPengajuanHonorarium={jadwal.riwayatPengajuan?.status || null}
            onSuccess={handleProsesPengajuanSuccess}
          />
        )}
        {proses == "VERIFIKASI" && (
          <FormProsesVerifikasi
            jadwalId={jadwal.id}
            statusPengajuanHonorarium={jadwal.riwayatPengajuan?.status || null}
            onRevise={handleProsesVerifikasiReviseSuccess}
            onApproved={handleProsesVerifikasiApproveSuccess}
          />
        )}

        {proses == "NOMINATIF" && (
          <FormProsesNominatif
            kegiatanId={jadwal.kegiatanId}
            pengajuanId={jadwal.riwayatPengajuanId}
            jadwalId={jadwal.id}
            jenisPengajuan={"HONORARIUM"}
            statusPengajuanHonorarium={jadwal.riwayatPengajuan?.status || null}
            onGenerate={function (): void {
              throw new Error("Function not implemented.");
            }}
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
};

const handleProsesPengajuan = async (jadwalId: string) => {
  const newStatus: STATUS_PENGAJUAN = "SUBMITTED";
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
  statusPengajuanHonorarium: STATUS_PENGAJUAN | string | null;
  onSuccess?: (jadwalId: string, newStatus: STATUS_PENGAJUAN | string) => void;
}
const FormProsesPengajuan = ({
  jadwalId,
  statusPengajuanHonorarium,
  onSuccess = () => {},
}: FormProsesPengajuanProps) => {
  const [status, setStatus] = useState<STATUS_PENGAJUAN | null>(
    getStatusPengajuan(statusPengajuanHonorarium)
  );

  const handleOnClick = async () => {
    const proses = await handleProsesPengajuan(jadwalId);
    if (proses.success) {
      onSuccess(jadwalId, proses.data);
      setStatus(proses.data);
    }
  };

  const isStatusNullDraftRevise =
    status === "DRAFT" || status === "REVISE" || status === null;

  return (
    <>
      {isStatusNullDraftRevise && (
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
  //console.log(jadwalId);
  const newStatus: STATUS_PENGAJUAN = "APPROVED";
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
  const newStatus: STATUS_PENGAJUAN = "REVISE";
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
  statusPengajuanHonorarium: STATUS_PENGAJUAN | null;
  onRevise?: (
    jadwalId: string,
    newStatus: STATUS_PENGAJUAN,
    catatan: string
  ) => void;
  onApproved?: (jadwalId: string, newStatus: STATUS_PENGAJUAN) => void;
}
const FormProsesVerifikasi = ({
  jadwalId,
  statusPengajuanHonorarium,
  onRevise = () => {},
  onApproved = () => {},
}: FormProsesVerifikasiProps) => {
  const [status, setStatus] = useState<STATUS_PENGAJUAN | null>(
    statusPengajuanHonorarium
  );
  const [catatan, setCatatan] = useState<string>("");
  const handleOnClickSetuju = async () => {
    const proses = await handleProsesVerifikasiSetuju(jadwalId);
    if (proses.success) {
      setStatus(proses.data);
      // call parent on success
      onApproved(jadwalId, proses.data);
    }
  };

  const handleOnClickRevisi = async (catatan: string) => {
    const proses = await handleProsesVerifikasiRevisi(jadwalId, catatan);
    if (proses.success) {
      setStatus(proses.data);
      onRevise(jadwalId, proses.data, catatan);
    }
  };

  const isStatusSubmittedRevised =
    status === "SUBMITTED" || status === "REVISED";

  return (
    <div className="flex flex-col px-4 py-2 w-full border-t border-gray-300 gap-2">
      {isStatusSubmittedRevised && (
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

interface FormProsesNominatifProps {
  kegiatanId: string;
  pengajuanId: string | null;
  jadwalId: string;
  jenisPengajuan: JENIS_PENGAJUAN;
  statusPengajuanHonorarium: STATUS_PENGAJUAN | null;
  onGenerate: () => void;
}
const FormProsesNominatif = ({
  kegiatanId,
  pengajuanId,
  jadwalId,
  jenisPengajuan,
  statusPengajuanHonorarium,
  onGenerate,
}: FormProsesNominatifProps) => {
  if (
    !pengajuanId ||
    (statusPengajuanHonorarium !== "APPROVED" &&
      statusPengajuanHonorarium !== "VERIFIED")
  )
    return null;

  return (
    <div className="flex flex-col px-4 py-2 w-full border-gray-300 gap-2">
      <FormNominatif
        kegiatanId={kegiatanId}
        pengajuanId={pengajuanId}
        jadwalId={jadwalId}
        jenisPengajuan={jenisPengajuan}
        onSubmit={function (data: NominatifPembayaranWithoutFile): void {
          throw new Error("Function not implemented.");
        }}
        onGenerate={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
  );
};

interface PreviewDaftarHadirProps {
  jadwalId: string;
}
const PreviewDaftarHadir = ({ jadwalId }: PreviewDaftarHadirProps) => {
  return (
    <ButtonEye
      className="border-none h-9 w-9"
      url={`/download/dokumen-daftar-hadir/${jadwalId}`}
    />
  );
};

interface PreviewUndanganNarsumProps {
  jadwalId: string;
}
const PreviewUndanganNarsum = ({ jadwalId }: PreviewUndanganNarsumProps) => {
  return (
    <ButtonEye
      className="border-none h-9 w-9"
      url={`/download/dokumen-undangan-narasumber/${jadwalId}`}
    />
  );
};
