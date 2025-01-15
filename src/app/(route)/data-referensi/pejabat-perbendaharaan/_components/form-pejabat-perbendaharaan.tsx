import { simpanPejabatPerbendaharaan } from "@/actions/pejabat-perbendaharaan";
import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import RequiredLabel from "@/components/form/required";
import SelectGolonganRuang from "@/components/form/select-golongan-ruang";
import SelectJenisJabatanPerbendaharaan from "@/components/form/select-jenis-jabatan-perbendaharaan";
import SelectSatkerAnggaran from "@/components/form/select-satker-anggaran";
import ToastErrorContainer from "@/components/form/toast-error-children";
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
import isDateLte from "@/utils/date";
import {
  PejabatPerbendaharaan,
  pejabatPerbendaharaanSchema,
  PejabatPerbendaharaan as ZPejabatPerbendaharaan,
} from "@/zod/schemas/pejabat-perbendaharaan";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const tmtMulai = watch("tmtMulai");
  const tmtSelesai = watch("tmtSelesai");

  const onSubmit = async (data: ZPejabatPerbendaharaan) => {
    // tidak ada file makan tidak perlu diubah menjadi form data
    const simpan = await simpanPejabatPerbendaharaan(data);
    if (!simpan.success) {
      console.log("Gagal menyimpan pejabatPerbendaharaan:", simpan.error);
      alert(`Gagal menyimpan pejabatPerbendaharaan ${simpan.message}`);
      return;
    } else {
      toast.success("Berhasil menyimpan pejabatPerbendaharaan");
      handleFormSubmitComplete?.(simpan.success);
    }
  };

  useEffect(() => {
    if (tmtMulai && tmtSelesai) {
      const lte = isDateLte(tmtMulai, tmtSelesai);
      if (!lte) {
        console.log("trigger validation", tmtMulai, tmtSelesai);
        toast.error(
          <ToastErrorContainer>
            Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai
          </ToastErrorContainer>,
          { position: "top-center" }
        );
        setValue("tmtSelesai", tmtMulai);
        // trigger("tanggalMulai");
        trigger("tmtSelesai");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmtMulai, tmtSelesai]);

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
            name="NIK"
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
                  NIP
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
            name="pangkatGolonganId"
            control={control}
            render={({ field }) => (
              <FormItem>
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
        </div>

        <FormField
          name="satkerId"
          control={control}
          render={({ field }) => (
            <FormItem className="">
              <FormLabel>
                Satker Anggaran
                <RequiredLabel />
              </FormLabel>
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
              <FormLabel>
                Jabatan
                <RequiredLabel />
              </FormLabel>
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
                <FormLabel htmlFor="tmtMulai">
                  Tanggal Mulai
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <BasicDatePicker
                    inputReadOnly
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
                    inputReadOnly
                    name={field.name}
                    error={errors.tmtSelesai}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(tmtMulai),
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
