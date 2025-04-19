import simpanPeserta from "@/actions/peserta";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import {
  default as RequiredLabel,
  RequiredLabelWithCatatan,
} from "@/components/form/required";
import SelectEselon from "@/components/form/select-eselon";
import SelectGolonganRuang from "@/components/form/select-golongan-ruang";
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
import { cn } from "@/lib/utils";
import {
  Peserta,
  PesertaForEditing,
  pesertaSchema,
} from "@/zod/schemas/peserta";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormPesertaProps {
  onCancel?: () => void;
  onSaveSuccess?: (data: Peserta) => void;
  className?: string;
  peserta?: Partial<PesertaForEditing>; // Allow partial initial data
}
const FormPeserta = ({
  className,
  onCancel,
  onSaveSuccess = () => {}, // Provide a default no-op function
  peserta: initialData = {}, // Provide an empty object as default value
}: FormPesertaProps) => {
  const form = useForm<PesertaForEditing>({
    resolver: zodResolver(pesertaSchema),
    defaultValues: {
      id: "",
      nama: "",
      NIP: "",
      NPWP: "",
      jabatan: "",
      eselon: null,
      pangkatGolonganId: "", // Use empty string instead of null
      email: "",
      bank: "",
      namaRekening: "",
      nomorRekening: "",
      telp: "",
      dokumenPeryataanRekeningBerbeda: null,
      dokumenPeryataanRekeningBerbedaCuid: createId() + ".pdf",
      ...initialData, // Override defaults with initialData if provided
    },
  });
  const { control, handleSubmit, watch } = form;

  const dokumenPeryataanRekeningBerbedaCuid = watch(
    "dokumenPeryataanRekeningBerbedaCuid"
  );
  const pesertaId = watch("id");

  const handleFileChange = (file: File | null) => {
    // Do nothing if the file is null
  };

  const [
    isDokumenPeryataanRekeningBerbedaUploaded,
    setIsDokumenPeryataanRekeningBerbedaUploaded,
  ] = useState(false);

  const handleFileUploadCompleted = (field: string) => {
    console.log("File uploaded", field);
    setIsDokumenPeryataanRekeningBerbedaUploaded(true);
  };

  const onSubmit = async (data: Peserta) => {
    try {
      const { dokumenPeryataanRekeningBerbeda, ...dataWithoutFile } = data;
      const existingId = initialData?.id;
      const simpan = await simpanPeserta(dataWithoutFile, existingId);
      if (!simpan.success) {
        toast.error(`Error saving peserta: ${simpan.error} ${simpan.message}`);
      } else {
        toast.success("Berhasil menyimpan peserta");
        console.log("Berhasil menyimpan peserta:", data);
        onSaveSuccess(data);
      }
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          name="nama"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nama
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <FormField
            name="id"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>
                  NIK
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="NIP"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>
                  <RequiredLabelWithCatatan label="NIP" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="NPWP"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>
                  <RequiredLabelWithCatatan label="NPWP" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <FormField
            name="jabatan"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-10/12">
                <FormLabel>
                  <RequiredLabelWithCatatan label="Jabatan" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="pangkatGolonganId"
            control={control}
            render={({ field }) => (
              <FormItem className="w-56">
                <FormLabel>Gol/Ruang</FormLabel>
                <FormControl>
                  <SelectGolonganRuang
                    fieldName={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="eselon"
            control={control}
            render={({ field }) => (
              <FormItem className="w-56">
                <FormLabel>Eselon</FormLabel>
                <FormControl>
                  <SelectEselon
                    fieldName={field.name}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <FormField
            name="bank"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-2/12">
                <FormLabel>
                  Bank <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="namaRekening"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-7/12">
                <FormLabel>
                  Nama Rekening
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="nomorRekening"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-3/12">
                <FormLabel>
                  Nomor Rekening
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <FormField
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="telp"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Telepon</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="dokumenPeryataanRekeningBerbeda"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={field.name}>
                Pernyataan Beda Rekening (jika nama berbeda)
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={dokumenPeryataanRekeningBerbedaCuid}
                  name={field.name}
                  onFileChange={handleFileChange}
                  onFileUploadComplete={handleFileUploadCompleted}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div
          className={cn(
            "flex flex-col sm:flex-row sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6"
          )}
        >
          <Button type="submit">Submit</Button>
          <Button type="button" variant={"outline"} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormPeserta;
