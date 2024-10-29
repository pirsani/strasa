import { KegiatanWithDetail } from "@/actions/kegiatan";
import { pengajuanPembayaranUangHarian } from "@/actions/kegiatan/uang-harian/nominatif";
import updateBendaharaPpkNominatifUhDalamNegeri from "@/actions/kegiatan/uang-harian/nominatif-dalam-negeri";
import updateBendaharaPpkNominatifUhLuarNegeri from "@/actions/kegiatan/uang-harian/nominatif-luar-negeri";
import CummulativeErrors from "@/components/form/cummulative-error";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import RequiredLabel from "@/components/form/required";
import SelectBendahara from "@/components/form/select-bendahara";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { JENIS_PENGAJUAN } from "@/lib/constants";
import {
  NominatifPembayaran,
  nominatifPembayaranSchema,
} from "@/zod/schemas/nominatif-pembayaran";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormNominatifPembayaranUhProps {
  kegiatan: KegiatanWithDetail;
  onCanceled?: () => void;
  onSuccess?: (data: NominatifPembayaran) => void;
  jenisPengajuan: JENIS_PENGAJUAN;
}
const FormNominatifPembayaranUh = ({
  kegiatan,
  onCanceled = () => {},
  onSuccess = () => {},
  jenisPengajuan: initJenisPengajuan,
}: FormNominatifPembayaranUhProps) => {
  const kegiatanId = kegiatan.id;
  const form = useForm<NominatifPembayaran>({
    resolver: zodResolver(nominatifPembayaranSchema),
    defaultValues: {
      id: createId(),
      buktiPajakCuid: "buktiPajak" + createId() + ".pdf",
      kegiatanId: kegiatanId ?? "",
      jenisPengajuan: initJenisPengajuan,
      jadwalId: "",
      bendaharaId: "",
      ppkId: "",
    },
  });

  const {
    setValue,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const jenisPengajuan = watch("jenisPengajuan");
  const buktiPajakCuid = watch("buktiPajakCuid");
  const jadwalId = watch("jadwalId");
  const bendaharaId = watch("bendaharaId");
  const ppkId = watch("ppkId");
  const isPengajuanHonorarium = jenisPengajuan === "HONORARIUM";

  const handleFileChange = (file: File | null) => {
    // Do nothing if the file is null
  };

  const onSubmit = async (data: NominatifPembayaran) => {
    console.log(data);
    const { dokumenBuktiPajak, ...nominatifPembayaranWithoutFile } = data;

    const pembayaran = await pengajuanPembayaranUangHarian(
      nominatifPembayaranWithoutFile
    );

    if (pembayaran.success) {
      toast.success("Pengajuan pembayaran berhasil diajukan");
      onSuccess(data);
    } else {
      toast.error(`Pengajuan pembayaran gagal diajukan ${pembayaran.message}`);
    }
  };

  const handleReset = () => {
    onCanceled();
    reset({
      id: createId(),
      buktiPajakCuid: "buktiPajak" + createId() + ".pdf",
      kegiatanId: kegiatanId ?? "",
      jenisPengajuan: initJenisPengajuan,
      jadwalId: "",
      bendaharaId: "",
      ppkId: "",
    });
  };

  const handleGenerate = async () => {
    switch (jenisPengajuan) {
      case "UH_LUAR_NEGERI":
        const updateBendaharaPpkUhLn =
          await updateBendaharaPpkNominatifUhLuarNegeri(
            kegiatanId,
            bendaharaId,
            ppkId
          );
        if (updateBendaharaPpkUhLn.success) {
          window.open(
            `/download/nominatif-uh-luar-negeri/${kegiatanId}`,
            "_blank"
          );
        } else {
          toast.error("Gagal mengupdate bendahara dan ppk");
        }

        break;
      case "UH_DALAM_NEGERI":
        const updateBendaharaPpkUhDn =
          await updateBendaharaPpkNominatifUhDalamNegeri(
            kegiatanId,
            bendaharaId,
            ppkId
          );

        if (updateBendaharaPpkUhDn.success) {
          window.open(
            `/download/nominatif-uh-dalam-negeri/${kegiatanId}`,
            "_blank"
          );
        } else {
          toast.error("Gagal mengupdate bendahara dan ppk");
        }

        break;
      default:
        break;
    }
    console.log(jadwalId);
  };

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kegiatanId]);

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form
          className="flex flex-col gap-4 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-row gap-2">
            <FormField
              control={control}
              name="bendaharaId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Bendahara <RequiredLabel />
                  </FormLabel>
                  <FormControl>
                    <SelectBendahara
                      fieldName="bendaharaId"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row gap-2">
            <FormField
              control={control}
              name="ppkId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    PPK <RequiredLabel />
                  </FormLabel>
                  <FormControl>
                    <SelectBendahara
                      fieldName="ppkId"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button
              className="bg-green-700"
              type="button"
              disabled={!jenisPengajuan}
              onClick={handleGenerate}
            >
              <WandSparkles size={20} />
              <span>Generate</span>
            </Button>
          </div>
          <div className="flex flex-row gap-2">
            <FormField
              control={form.control}
              name="dokumenBuktiPajak"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Upload Dokumen Bukti Pajak
                    <RequiredLabel />
                  </FormLabel>
                  <FormControl>
                    <FormFileImmediateUpload
                      cuid={buktiPajakCuid}
                      folder={kegiatanId}
                      name={field.name}
                      onFileChange={handleFileChange}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row gap-2">
            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="lorem ipsum..."
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <CummulativeErrors errors={errors} />
          <div className="flex flex-row gap-2 justify-end">
            <Button type="submit" disabled={isSubmitting}>
              Ajukan Pembayaran
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormNominatifPembayaranUh;
