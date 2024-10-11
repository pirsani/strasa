import simpanNarasumber from "@/actions/narasumber";
import { cn } from "@/lib/utils";
import {
  Narasumber,
  NarasumberForEditing,
  narasumberSchema,
} from "@/zod/schemas/narasumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import FormFileImmediateUpload from "./form-file-immediate-upload";
import { default as RequiredLabel, RequiredLabelWithCatatan } from "./required";
import SelectEselon from "./select-eselon";
import SelectGolonganRuang from "./select-golongan-ruang";

interface FormNarasumberProps {
  onCancel?: () => void;
  onSaveSuccess?: (data: Narasumber) => void;
  className?: string;
  narasumber?: Partial<NarasumberForEditing>; // Allow partial initial data
}
const FormNarasumber = ({
  className,
  onCancel,
  onSaveSuccess = () => {}, // Provide a default no-op function
  narasumber: initialData = {}, // Provide an empty object as default value
}: FormNarasumberProps) => {
  const form = useForm<NarasumberForEditing>({
    resolver: zodResolver(narasumberSchema),
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
      nomorTelepon: "",
      dokumenPeryataanRekeningBerbeda: null,
      dokumenPeryataanRekeningBerbedaCuid: createId() + ".pdf",
      ...initialData, // Override defaults with initialData if provided
    },
  });
  const { control, handleSubmit, watch } = form;

  const dokumenPeryataanRekeningBerbedaCuid = watch(
    "dokumenPeryataanRekeningBerbedaCuid"
  );
  const narasumberId = watch("id");

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

  const onSubmit = async (data: Narasumber) => {
    try {
      const { dokumenPeryataanRekeningBerbeda, ...dataWithoutFile } = data;
      const existingId = initialData?.id;
      const simpan = await simpanNarasumber(dataWithoutFile, existingId);
      if (!simpan.success) {
        toast.error(
          `Error saving narasumber: ${simpan.error} ${simpan.message}`
        );
      } else {
        toast.success("Berhasil menyimpan narasumber");
        console.log("Berhasil menyimpan narasumber:", data);
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
        <div className="flex flex-col sm:flex-row gap-2">
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

        <div className="flex flex-col sm:flex-row gap-2">
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

        <div className="flex flex-col sm:flex-row gap-2">
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

        <div className="flex flex-col sm:flex-row gap-2">
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
            name="nomorTelepon"
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

export default FormNarasumber;
