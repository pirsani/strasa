import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import RequiredLabel from "@/components/form/required";
import SelectBendahara from "@/components/form/select-bendahara";
import SelectJenisPengajuan from "@/components/form/select-jenis-pengajuan";
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
  NominatifHonorarium,
  nominatifHonorariumSchema,
} from "@/zod/schemas/nominatif-honorarium";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { WandSparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import SelectJadwalHonorarium from "./select-jadwal-honorarium";

interface FormNominatifHonorariumProps {
  kegiatanId: string;
  onCanceled?: () => void;
  onSuccess?: (data: NominatifHonorarium) => void;
}
const FormNominatifHonorarium = ({
  kegiatanId,
  onCanceled = () => {},
  onSuccess = () => {},
}: FormNominatifHonorariumProps) => {
  const form = useForm<NominatifHonorarium>({
    resolver: zodResolver(nominatifHonorariumSchema),
    defaultValues: {
      id: kegiatanId,
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

  const handleReset = () => {
    reset();
    onCanceled();
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form className="flex flex-col gap-4 w-full">
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
                      fieldName="jenisPengajuan"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
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
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
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
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button className="bg-green-700" type="button">
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
                      folder={jadwalId}
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

export default FormNominatifHonorarium;
