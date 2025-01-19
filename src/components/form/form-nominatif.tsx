import { updateBendaharaPpkNominatifHonorarium } from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import updateBendaharaPpkNominatifUhDalamNegeri from "@/actions/kegiatan/uang-harian/nominatif-dalam-negeri";
import updateBendaharaPpkNominatifUhLuarNegeri from "@/actions/kegiatan/uang-harian/nominatif-luar-negeri";
import CummulativeErrors from "@/components/form/cummulative-error";
import RequiredLabel from "@/components/form/required";
import SelectBendahara from "@/components/form/select-bendahara";
import InfoKurs from "@/components/info-kurs";
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
import { KursResponse } from "@/utils/kurs-bi";
import {
  NominatifPembayaranWithoutFile,
  nominatifPembayaranWithoutFileSchema,
} from "@/zod/schemas/nominatif-pembayaran";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { WandSparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormNominatifProps {
  kegiatanId: string;
  pengajuanId: string;
  jadwalId: string;
  jenisPengajuan: JENIS_PENGAJUAN;
  onSubmit: (data: NominatifPembayaranWithoutFile) => void;
  onGenerate: () => void;
}
export const FormNominatif = ({
  kegiatanId,
  pengajuanId,
  jadwalId,
  jenisPengajuan,
  onSubmit = () => {},
}: FormNominatifProps) => {
  const form = useForm<NominatifPembayaranWithoutFile>({
    resolver: zodResolver(nominatifPembayaranWithoutFileSchema),
    defaultValues: {
      id: createId(),
      buktiPajakCuid: "buktiPajak" + createId() + ".pdf",
      kegiatanId: kegiatanId ?? "",
      jenisPengajuan: jenisPengajuan,
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

  //const jenisPengajuan = watch("jenisPengajuan");
  const buktiPajakCuid = watch("buktiPajakCuid");
  //const jadwalId = watch("jadwalId");
  const bendaharaId = watch("bendaharaId");
  const ppkId = watch("ppkId");
  const isPengajuanHonorarium = jenisPengajuan === "HONORARIUM";
  const [kurs, setKurs] = useState<KursResponse | null>(null);

  const handleGenerate = async () => {
    switch (jenisPengajuan) {
      case "HONORARIUM":
        //update pengajuan honorarium
        if (!jadwalId || !bendaharaId || !ppkId) {
          return;
        }
        const updateBendaharaPpk = await updateBendaharaPpkNominatifHonorarium(
          jadwalId,
          bendaharaId,
          ppkId
        );
        if (updateBendaharaPpk.success) {
          window.open(
            `/download/nominatif-honorarium/${kegiatanId}/${jadwalId}/${bendaharaId}/${ppkId}`,
            "_blank"
          );
        } else {
          toast.error("Gagal generate nominatif honorarium");
        }

        break;
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
              <span>Generate Daftar Nomitatif</span>
            </Button>
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
      <div>{jenisPengajuan === "UH_LUAR_NEGERI" && <InfoKurs />}</div>
    </div>
  );
};

export default FormNominatif;
