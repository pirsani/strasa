import { cn } from "@/lib/utils";
import {
  Narasumber,
  NarasumberForEditing,
  narasumberSchema,
} from "@/zod/schemas/narasumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import InputFile from "./input-file";
import Required from "./required";

interface FormNarasumberProps {
  onCancel?: () => void;
  onSubmit?: (data: Narasumber) => void;
  className?: string;
  narasumber?: Partial<NarasumberForEditing>; // Allow partial initial data
}
const FormNarasumber = ({
  className,
  onCancel,
  onSubmit = () => {}, // Provide a default no-op function
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
      ...initialData, // Override defaults with initialData if provided
    },
  });
  const { control, handleSubmit } = form;

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
                <Required />
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
                  <Required />
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
                  NIP
                  <Required />
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
                  NPWP
                  <Required />
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
                  Jabatan
                  <Required />
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
              <FormItem>
                <FormLabel>Gol/Ruang</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""} // Convert null to empty string
                    placeholder="format III/A IV/C"
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
              <FormItem>
                <FormLabel>Eselon</FormLabel>
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

        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="bank"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-2/12">
                <FormLabel>Bank</FormLabel>
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
                <FormLabel>Nama Rekening</FormLabel>
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
                <FormLabel>Nomor Rekening</FormLabel>
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
                <InputFile
                  name={field.name}
                  onFileChange={(file) => field.onChange(file)}
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
