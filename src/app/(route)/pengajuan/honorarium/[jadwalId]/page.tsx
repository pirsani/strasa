import { getSessionPengguna } from "@/actions/pengguna/session";
import { getOptionsSbmHonorarium } from "@/actions/sbm";
import FloatingPdfPreviewContainer from "@/components/floating-pdf-preview-container";
import { getObjPlainJadwalById } from "@/data/jadwal";
import { checkPermissionAlurProses } from "@/lib/check-permission-alur-proses";
import { JadwalKelasNarasumber } from "./_components/jadwal-kelas-narasumber";

export default async function HonorariumDetilPage({
  params,
}: {
  params: Promise<{ jadwalId: string }>;
}) {
  const jadwalId = (await params).jadwalId;
  const jadwal = await getObjPlainJadwalById(jadwalId);
  const optionsSbmHonorarium = await getOptionsSbmHonorarium();

  const statusPengajuan = jadwal?.riwayatPengajuan?.status;

  const pengguna = await getSessionPengguna();

  const prosesPermission = await checkPermissionAlurProses(statusPengajuan);

  if (!prosesPermission) {
    return <div>Unauthorized</div>;
  }

  const { proses } = prosesPermission;

  // let proses: ALUR_PROSES | null = null;

  // const createAnyProsesPengajuan = await checkSessionPermission({
  //   actions: ["create:any"],
  //   resource: "proses-pengajuan",
  //   redirectOnUnauthorized: false,
  // });

  // const createOwnProsesPengajuan = await checkSessionPermission({
  //   actions: ["create:own"],
  //   resource: "proses-pengajuan",
  //   redirectOnUnauthorized: false,
  // });

  // const createAnyProsesVerifikasi = await checkSessionPermission({
  //   actions: ["create:any"],
  //   resource: "proses-verifikasi",
  //   redirectOnUnauthorized: false,
  // });

  // const createOwnProsesVerifikasi = await checkSessionPermission({
  //   actions: ["create:own"],
  //   resource: "proses-verifikasi",
  //   redirectOnUnauthorized: false,
  // });

  // const createAnyProsesNominatif = await checkSessionPermission({
  //   actions: ["create:any"],
  //   resource: "proses-daftar-nominatif",
  //   redirectOnUnauthorized: false,
  // });

  // const createOwnProsesNominatif = await checkSessionPermission({
  //   actions: ["create:own"],
  //   resource: "proses-daftar-nominatif",
  //   redirectOnUnauthorized: false,
  // });

  // const createAnyProsesPembayaran = await checkSessionPermission({
  //   actions: ["create:any"],
  //   resource: "proses-pembayaran",
  //   redirectOnUnauthorized: false,
  // });

  // const createOwnProsesPembayaran = await checkSessionPermission({
  //   actions: ["create:own"],
  //   resource: "proses-pembayaran",
  //   redirectOnUnauthorized: false,
  // });

  // if (
  //   !createAnyProsesPengajuan &&
  //   !createOwnProsesPengajuan &&
  //   !createAnyProsesVerifikasi &&
  //   !createOwnProsesVerifikasi &&
  //   !createAnyProsesNominatif &&
  //   !createOwnProsesNominatif &&
  //   !createAnyProsesPembayaran &&
  //   !createOwnProsesPembayaran
  // ) {
  //   console.log("Unauthorized");
  //   console.log(pengguna.data?.roles);
  //   return <div>Unauthorized</div>;
  // }

  // console.log("statusPengajuan", statusPengajuan);

  // switch (statusPengajuan) {
  //   case "REVISE":
  //   case "DRAFT":
  //     proses = "PENGAJUAN";
  //     break;
  //   case "SUBMITTED":
  //   case "REVISED":
  //     createAnyProsesVerifikasi || createOwnProsesVerifikasi
  //       ? (proses = "VERIFIKASI")
  //       : null;
  //     break;
  //   case "APPROVED":
  //   case "VERIFIED":
  //     createAnyProsesNominatif || createOwnProsesNominatif
  //       ? (proses = "NOMINATIF")
  //       : null;
  //     break;
  //   case "REQUEST_TO_PAY":
  //     createAnyProsesPembayaran || createOwnProsesPembayaran
  //       ? (proses = "PEMBAYARAN")
  //       : null;
  //     break;
  //   case "PAID":
  //     proses = "SELESAI";
  //     break;
  //   case "END":
  //     proses = "SELESAI";
  //     break;
  //   default:
  //     console.log("default proses");
  //     createAnyProsesPengajuan || createOwnProsesPengajuan
  //       ? (proses = "PENGAJUAN")
  //       : null;
  //     break;
  // }

  // check otorisasi

  if (!jadwal) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2">Pengajuan Honorarium</h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <JadwalKelasNarasumber
          jadwal={jadwal}
          proses={proses}
          optionsSbmHonorarium={optionsSbmHonorarium}
        />
      </div>
      <FloatingPdfPreviewContainer />
    </div>
  );
}
