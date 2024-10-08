"use client";
import ajukanUhLuarNegeri from "@/actions/kegiatan/uang-harian/luar-negeri";
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
  DokumenUhLuarNegeri,
  DokumenUhLuarNegeriEditMode,
  dokumenUhLuarNegeriSchema,
  dokumenUhLuarNegeriSchemaEditMode,
  dokumenUhLuarNegeriWithoutFileSchema,
} from "@/zod/schemas/dokumen-uh-luar-negeri";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { Loader } from "lucide-react";
import { useState } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";

type FormValues<T> = T extends true
  ? DokumenUhLuarNegeriEditMode
  : DokumenUhLuarNegeri;

interface UhLuarNegeriContainerProps {
  kegiatanId: string;
  editId?: number | null;
}
const UhLuarNegeriContainer = ({
  editId,
  kegiatanId,
}: UhLuarNegeriContainerProps) => {
  const isEditMode = editId != null;
  type FormMode = typeof isEditMode;
  const form = useForm<FormValues<FormMode>>({
    resolver: zodResolver(
      isEditMode ? dokumenUhLuarNegeriSchemaEditMode : dokumenUhLuarNegeriSchema
    ),
    defaultValues: {
      laporanKegiatanCuid: "laporanKegiatan" + createId() + ".pdf",
      daftarHadirCuid: "daftarHadir" + createId() + ".pdf",
      dokumentasiKegiatanCuid: "dokumentasi" + createId() + ".pdf",
      rampunganTerstempelCuid: "rampungan" + createId() + ".pdf",
      suratPersetujuanJaldisSetnegCuid: "suratSetneg" + createId() + ".pdf",
      pasporCuid: "paspr" + createId() + ".pdf",
      tiketBoardingPassCuid: "tiketBoardingPass" + createId() + ".pdf",
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = form;

  // Watch the form values
  const laporanKegiatanCuid = watch("laporanKegiatanCuid");
  const daftarHadirCuid = watch("daftarHadirCuid");
  const dokumentasiKegiatanCuid = watch("dokumentasiKegiatanCuid");
  const rampunganTerstempelCuid = watch("rampunganTerstempelCuid");
  const suratPersetujuanJaldisSetnegCuid = watch(
    "suratPersetujuanJaldisSetnegCuid"
  );
  const pasporCuid = watch("pasporCuid");
  const tiketBoardingPassCuid = watch("tiketBoardingPassCuid");

  // Use a ref to store the folderCuid
  // const folderCuidRef = useRef(createId());
  // const folderCuid = folderCuidRef.current;
  setValue("kegiatanId", kegiatanId);

  const [fileUrls, setFileUrls] = useState<{ [key: string]: string | null }>(
    {}
  );

  const [pdfUrls, setPdfUrls] = useState<{ [key: string]: string | null }>({});

  const onSubmit: SubmitHandler<FormValues<FormMode>> = async (data) => {
    //send without file
    const dataparsedWithoutFile =
      dokumenUhLuarNegeriWithoutFileSchema.parse(data);
    console.log(dataparsedWithoutFile);
    const pengajuan = await ajukanUhLuarNegeri(dataparsedWithoutFile);
    if (pengajuan.success) {
      toast.success("Pengajuan berhasil");
    } else {
      toast.error(`Pengajuan gagal ${pengajuan.error} ${pengajuan.message}`);
    }
  };

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
        Data Dukung Pengajuan Uang Harian Luar Negeri
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
              <FormField
                control={form.control}
                name="suratSetneg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Surat Persetujuan Setneg
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={suratPersetujuanJaldisSetnegCuid}
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
                name="paspor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      paspor(ID,Exit Permit, Stempel Imigrasi)
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={pasporCuid}
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
                name="tiketBoardingPass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">
                      Tiket atau Boarding Pass
                    </FormLabel>
                    <div className="flex flex-row gap-2 items-center">
                      <FormControl>
                        <FormFileImmediateUpload
                          cuid={tiketBoardingPassCuid}
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
            </form>
          </Form>
        </div>
        <div className="w-full">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Ajukan {isSubmitting && <Loader className="animate-spin mx-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UhLuarNegeriContainer;
