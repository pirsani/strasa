"use client";
import { updateBuktiPembayaranHonorarium } from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import { updateBuktiPembayaranUh } from "@/actions/kegiatan/uang-harian/bukti-pembayaran";
import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import RequiredLabel from "@/components/form/required";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useFileStore from "@/hooks/use-file-store";
import { JENIS_PENGAJUAN } from "@/lib/constants";
import { Pembayaran, pembayaranSchema } from "@/zod/schemas/pembayaran";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
interface FormPembayaranProps {
  riwayatPengajuanId: string;
  jenisPengajuan?: JENIS_PENGAJUAN;
}

const FormPembayaran = ({
  riwayatPengajuanId,
  jenisPengajuan,
}: FormPembayaranProps) => {
  const form = useForm<Pembayaran>({
    defaultValues: {
      riwayatPengajuanId,
      dibayarTanggal: new Date(),
      buktiPembayaranCuid: createId(),
      buktiPembayaran: null,
      filenameBuktiPembayaran: "",
      mak: "",
    },
    resolver: zodResolver(pembayaranSchema),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const buktiPembayaranCuid = form.watch("buktiPembayaranCuid");
  const [isUpladed, setIsUploaded] = useState<boolean>(false);
  // const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (data: Pembayaran) => {
    console.log(data);
    const { buktiPembayaran, ...pembayaranWithoutFile } = data;
    switch (jenisPengajuan) {
      case "HONORARIUM":
        const res = await updateBuktiPembayaranHonorarium(
          pembayaranWithoutFile
        );
        if (res.success) {
          toast.success("Bukti pembayaran berhasil diupload");
          router.refresh();
        } else {
          toast.error(`Gagal mengupload bukti pembayaran ${res.message}`);
        }
        break;
      case "UH_DALAM_NEGERI":
      case "UH_LUAR_NEGERI":
      case "UH":
        const res2 = await updateBuktiPembayaranUh(pembayaranWithoutFile);
        if (res2.success) {
          toast.success("Bukti pembayaran berhasil diupload");
          router.refresh();
        } else {
          toast.error(`Gagal mengupload bukti pembayaran ${res2.message}`);
        }
        break;
    }
  };

  const handleUploadComplete = (name: string, file?: File | null) => {
    if (!file) return;
    setIsUploaded(true);
    //setValue("filenameBuktiPembayaran", file?.name ?? null);
    toast.success(`File ${name} berhasil diupload`);
  };

  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (file: File | null) => {
    if (file !== null) {
      // check if file is pdf
      if (file.type === "application/pdf") {
        // only set file url if file is pdf
        const fileUrl = URL.createObjectURL(file);
        console.log(fileUrl);
        setFileUrl(fileUrl);
      }
      setValue("filenameBuktiPembayaran", file?.name ?? "");
    } else {
      setIsUploaded(false);
      setFileUrl(null);
      setValue("filenameBuktiPembayaran", "");
    }
  };

  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "application/x-rar-compressed",
    "application/octet-stream", // Some browsers may use this for .rar files
    ".pdf",
    ".zip",
    ".rar",
  ];

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          className="flex flex-col gap-2 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="mak"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MAK</FormLabel>
                <FormControl>
                  <Input placeholder="52xxxx" {...field} tabIndex={0} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dibayarTanggal"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="dibayarTanggal">
                  Tanggal Dibayar
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <BasicDatePicker
                    inputReadOnly={true}
                    name={field.name}
                    error={errors.dibayarTanggal}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(new Date().getFullYear(), 0, 1),
                      toDate: new Date(new Date().getFullYear(), 11, 31),
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buktiPembayaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="buktiPembayaran">
                  Upload Nota Dinas/Memorandum/SK Tim
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <FormFileImmediateUpload
                    cuid={buktiPembayaranCuid}
                    folder={riwayatPengajuanId}
                    name={field.name}
                    onFileChange={handleFileChange}
                    onFileUploadComplete={handleUploadComplete}
                    className="bg-white"
                    allowedTypes={allowedTypes}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <div className="flex flex-col gap-2">
            <h1 className="mb-2 font-semibold text-l">
              Upload Bukti Pembayaran
            </h1>
            <InputFileImmediateUpload
              name="file"
              folder={riwayatPengajuanId}
              cuid={cuid}
              onFileUploadComplete={handleUploadComplete}
              onFileChange={() => setIsUploaded(false)}
              allowedTypes={[
                "application/pdf",
                "application/zip",
                "application/x-rar-compressed",
                "application/octet-stream", // Some browsers may use this for .rar files
              ]}
            /> */}
          <div>
            <Button disabled={!isUpladed || isSubmitting} type="submit">
              Simpan {isSubmitting && "..."}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
};

export default FormPembayaran;
