import { simpanPejabatPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import SelectJenisJabatanPerbendaharaan from "@/components/form/select-jenis-jabatan-perbendaharaan";
import SelectSatkerAnggaran from "@/components/form/select-satker-anggaran";
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
  PejabatPerbendaharaan,
  pejabatPerbendaharaanSchema,
  PejabatPerbendaharaan as ZPejabatPerbendaharaan,
} from "@/zod/schemas/pejabat-perbendaharaan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormPejabatPerbendaharaanProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  pejabat?: Partial<PejabatPerbendaharaan> | null;
}
const FormPejabatPerbendaharaan = ({
  className,
  onCancel,
  handleFormSubmitComplete = () => {}, // Provide a default no-op function
  pejabat,
}: FormPejabatPerbendaharaanProps) => {
  const form = useForm<PejabatPerbendaharaan>({
    resolver: zodResolver(pejabatPerbendaharaanSchema),
    defaultValues: pejabat
      ? pejabat
      : {
          nama: "",
          NIK: "",
          NIP: "",
          pangkatGolonganId: "",
          satkerId: "",
          jabatanId: "",
        },
  });
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: ZPejabatPerbendaharaan) => {
    // tidak ada file makan tidak perlu diubah menjadi form data
    const simpan = await simpanPejabatPerbendaharaan(data);
    if (!simpan.success) {
      console.error("Gagal menyimpan pejabatPerbendaharaan:", simpan.error);
      alert(`Gagal menyimpan pejabatPerbendaharaan ${simpan.message}`);
      return;
    } else {
      toast.success("Berhasil menyimpan pejabatPerbendaharaan");
      handleFormSubmitComplete?.(simpan.success);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField
          name="nama"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="NIK"
            control={control}
            render={({ field }) => (
              <FormItem className="sm:w-1/3">
                <FormLabel>NIK</FormLabel>
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
                <FormLabel>NIP</FormLabel>
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
                    placeholder="format III/A IV/C"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="satkerId"
          control={control}
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Satker Anggaran</FormLabel>
              <FormControl>
                <SelectSatkerAnggaran
                  value={field.value}
                  fieldName={field.name}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="jabatanId"
          control={control}
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>Jabatan</FormLabel>
              <FormControl>
                <SelectJenisJabatanPerbendaharaan
                  value={field.value}
                  fieldName={field.name}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row w-full gap-2">
          <FormField
            control={form.control}
            name="tmtMulai"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="tmtMulai">Tanggal Mulai</FormLabel>
                <FormControl>
                  <BasicDatePicker
                    name={field.name}
                    error={errors.tmtMulai}
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
            name="tmtSelesai"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="tmtMulai">Tanggal Selesai</FormLabel>
                <FormControl>
                  <BasicDatePicker
                    name={field.name}
                    error={errors.tmtSelesai}
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
        </div>

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

export default FormPejabatPerbendaharaan;
