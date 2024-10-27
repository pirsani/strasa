import { KegiatanWithDetail } from "@/actions/kegiatan";
import { pengajuanPembayaran } from "@/actions/pembayaran";
import SelectJenisPengajuan from "@/app/(route)/daftar-nominatif/_components/select-jenis-pengajuan";
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
import SelectJadwalHonorarium from "./select-jadwal-honorarium";

interface FormNominatifPembayaranProps {
  kegiatan: KegiatanWithDetail;
  onCanceled?: () => void;
  onSuccess?: (data: NominatifPembayaran) => void;
}
const FormNominatifPembayaran = ({
  kegiatan,
  onCanceled = () => {},
  onSuccess = () => {},
}: FormNominatifPembayaranProps) => {
  const kegiatanId = kegiatan.id;
  const form = useForm<NominatifPembayaran>({
    resolver: zodResolver(nominatifPembayaranSchema),
    defaultValues: {
      id: createId(),
      buktiPajakCuid: "buktiPajak" + createId() + ".pdf",
      kegiatanId: kegiatanId ?? "",
      jenisPengajuan: "",
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
  const isPengajuanHonorarium = jenisPengajuan === "HONORARIUM";

  const handleFileChange = (file: File | null) => {
    // Do nothing if the file is null
  };

  const onSubmit = async (data: NominatifPembayaran) => {
    console.log(data);
    onSuccess(data);
    const { dokumenBuktiPajak, ...nominatifPembayaranWithoutFile } = data;

    const pembayaran = await pengajuanPembayaran(
      nominatifPembayaranWithoutFile
    );

    if (pembayaran.success) {
      toast.success("Pengajuan pembayaran berhasil diajukan");
      onSuccess(data);
    } else {
      toast.error("Pengajuan pembayaran gagal diajukan");
    }
  };

  const handleReset = () => {
    onCanceled();
    reset({
      id: createId(),
      buktiPajakCuid: "buktiPajak" + createId() + ".pdf",
      kegiatanId: kegiatanId ?? "",
      jenisPengajuan: "",
      jadwalId: "",
      bendaharaId: "",
      ppkId: "",
    });
  };

  const handleGenerate = () => {
    switch (jenisPengajuan) {
      case "HONORARIUM":
        window.open(
          `/download/nominatif-honorarium/${kegiatanId}/${jadwalId}`,
          "_blank"
        );
        break;
      case "UH_LUAR_NEGERI":
        window.open(
          `/download/nominatif-uh-luar-negeri/${kegiatanId}`,
          "_blank"
        );
        break;
      case "UH_DALAM_NEGERI":
        window.open(
          `/download/nominatif-uh-dalam-negeri/${kegiatanId}`,
          "_blank"
        );
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
              name="jenisPengajuan"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    Jenis Pengajuan <RequiredLabel />
                  </FormLabel>
                  <FormControl>
                    <SelectJenisPengajuan
                      kegiatan={kegiatan}
                      fieldName="jenisPengajuan"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {isPengajuanHonorarium && (
            <div className="flex flex-row gap-2">
              <FormField
                control={control}
                name="jadwalId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Jadwal Kelas Materi <RequiredLabel />
                    </FormLabel>
                    <FormControl>
                      <SelectJadwalHonorarium
                        kegiatanId={kegiatanId}
                        fieldName="jadwalId"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

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

export default FormNominatifPembayaran;
