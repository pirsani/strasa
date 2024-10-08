import ajukanUhDalamNegeri from "@/actions/kegiatan/uang-harian/dalam-negeri";
import ButtonEye from "@/components/button-eye-open-document";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useFileStore from "@/hooks/use-file-store";
import {
  DokumenUhDalamNegeri,
  DokumenUhDalamNegeriEditMode,
  dokumenUhDalamNegeriSchema,
  dokumenUhDalamNegeriSchemaEditMode,
  dokumenUhDalamNegeriWithoutFileSchema,
} from "@/zod/schemas/dokumen-uh-dalam-negeri";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";

type FormValues<T> = T extends true
  ? DokumenUhDalamNegeriEditMode
  : DokumenUhDalamNegeri;

interface UhDalamNegeriContainerProps {
  kegiatanId: string;
  editId?: number | null;
}
const UhDalamNegeriContainer = ({
  kegiatanId,
  editId,
}: UhDalamNegeriContainerProps) => {
  //this ensures that isEditMode will be false if editId is null or undefined
  const isEditMode = editId != null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(
      isEditMode
        ? dokumenUhDalamNegeriSchemaEditMode
        : dokumenUhDalamNegeriSchema
    ),
    defaultValues: {
      kegiatanId,
      laporanKegiatanCuid: "laporanKegiatan" + createId() + ".pdf",
      daftarHadirCuid: "daftarHadir" + createId() + ".pdf",
      dokumentasiKegiatanCuid: "dokumentasi" + createId() + ".pdf",
      rampunganTerstempelCuid: "rampungan" + createId() + ".pdf",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  // Watch the form values
  const laporanKegiatanCuid = watch("laporanKegiatanCuid");
  const daftarHadirCuid = watch("daftarHadirCuid");
  const dokumentasiKegiatanCuid = watch("dokumentasiKegiatanCuid");
  const rampunganTerstempelCuid = watch("rampunganTerstempelCuid");

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    // send without file because the file is already uploaded immediately on change selected file

    const dataparsedWithoutFile =
      dokumenUhDalamNegeriWithoutFileSchema.parse(data);
    const ajukan = await ajukanUhDalamNegeri(dataparsedWithoutFile);
    if (ajukan.success) {
      toast.success("Pengajuan berhasil");
    } else {
      toast.error(`Pengajuan gagal ${ajukan.error} ${ajukan.message}`);
    }
    console.log("[response]", ajukan);
  };

  const [fileUrls, setFileUrls] = useState<{ [key: string]: string | null }>(
    {}
  );
  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (
    file: File | null,
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    if (file !== null) {
      const fileUrl = URL.createObjectURL(file);
      setFileUrl(fileUrl);

      // Update the fileUrls state
      setFileUrls((prevUrls) => ({
        ...prevUrls,
        [field.name]: fileUrl,
      }));
    } else {
      setFileUrl(null);
      // Update the fileUrls state
      setFileUrls((prevUrls) => ({
        ...prevUrls,
        [field.name]: null,
      }));
    }
  };

  return (
    <div className="mt-6 border border-blue-500 rounded-lg">
      <h1 className="font-semibold text-lg py-2 p-2 border-b border-blue-600">
        Data Dukung Pengajuan Uang Harian Dalam Negeri
      </h1>
      <div className="flex flex-col gap-8 p-2 pb-8">
        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="laporanKegiatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-semibold">
                      laporan Kegiatan
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={laporanKegiatanCuid}
                          name={field.name}
                          folder={kegiatanId}
                          onFileChange={handleFileChange}
                          className="bg-white w-full border-2"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="daftarHadir"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-semibold">
                      Daftar Hadir
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={daftarHadirCuid}
                          name={field.name}
                          folder={kegiatanId}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dokumentasi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Dokumentasi</FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={dokumentasiKegiatanCuid}
                          folder={kegiatanId}
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rampungan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-semibold">
                      Rampungan yang distempel
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={rampunganTerstempelCuid}
                          folder={kegiatanId}
                          name={field.name}
                          onFileChange={handleFileChange}
                          className="bg-white"
                        />
                      </FormControl>
                      <ButtonEye url={fileUrls[field.name]} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full">
                <Button
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  type="submit"
                >
                  Ajukan
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UhDalamNegeriContainer;
