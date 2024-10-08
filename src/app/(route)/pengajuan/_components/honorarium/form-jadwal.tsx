import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileUpload from "@/components/form/form-file-upload";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Jadwal, jadwalSchema } from "@/zod/schemas/jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SelectKelas from "./select-kelas";
import SelectMateri from "./select-materi";
import SelectNarasumber from "./select-narasumber";

interface FormJadwalProps {
  onCancel: () => void;
  onSubmit?: (data: Jadwal) => void;
}
const FormJadwal = ({ onCancel, onSubmit = () => {} }: FormJadwalProps) => {
  const form = useForm<Jadwal>({
    resolver: zodResolver(jadwalSchema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          <FormField
            control={control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="w-64">
                <FormLabel htmlFor="tanggal">Tanggal</FormLabel>
                <FormControl>
                  <InputDatePicker
                    name={field.name}
                    error={errors.tanggal}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(new Date().getFullYear(), 0, 1),
                      toDate: new Date(new Date().getFullYear(), 11, 31),
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="kelasId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="kelasId">Kelas</FormLabel>
                <FormControl>
                  <SelectKelas
                    inputId={field.name}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="materiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="materiId">Materi</FormLabel>
              <FormControl>
                <SelectMateri
                  inputId={field.name}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="narasumberIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="narasumberIds">Narasumber</FormLabel>
              <FormControl>
                <SelectNarasumber
                  isMulti
                  inputId={field.name}
                  onChange={field.onChange}
                  values={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dokumenDaftarHadir"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenDaftarHadir">Daftar Hadir</FormLabel>
              <FormControl>
                <FormFileUpload name={field.name} className="bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dokumenSurat"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenSurat">
                Surat/Nodin/Memo Undangan Narsum
              </FormLabel>
              <FormControl>
                <FormFileUpload
                  name={field.name}
                  className="bg-white"
                  onFileChange={(file) => {
                    // Optional handling of file change
                    form.setValue(field.name, file ?? undefined); // Adjusted to fix the type issue
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={cn("flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6")}
        >
          <Button type="submit">Simpan</Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormJadwal;
