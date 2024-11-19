"use client";
import { simpanDataSp2d } from "@/actions/sp2d";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";

import CummulativeErrors from "@/components/form/cummulative-error";
import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import { RequiredLabelWithCatatan } from "@/components/form/required";
import SelectUnitKerja from "@/components/form/select-unit-kerja";
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
import formatCurrency from "@/utils/format-currency";
import { Sp2d as ZSp2d, sp2dSchema } from "@/zod/schemas/sp2d";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormSp2dProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  sp2d?: Partial<ZSp2d> | null;
  satkerId?: string;
}
const FormSp2d = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  sp2d,
  satkerId,
}: FormSp2dProps) => {
  const form = useForm<ZSp2d>({
    resolver: zodResolver(sp2dSchema),
    defaultValues: sp2d || {
      jumlahDibayar: BigInt(0),
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = form;
  const jumlahDibayarValue = watch("jumlahDibayar");

  const onSubmit = async (data: ZSp2d) => {
    try {
      const sp2d = await simpanDataSp2d(data);
      if (sp2d.success) {
        toast.success(
          `Berhasil menyimpan data sp2d ${sp2d.data?.unitKerja.nama}`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(sp2d.success);
    } catch (error) {
      toast.error("Gagal menyimpan data sp2d");
    }
    console.log(data);
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="unitKerjaId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unit Kerja</FormLabel>
                  <FormControl>
                    <SelectUnitKerja
                      onChange={field.onChange}
                      value={field.value}
                      fieldName={field.name}
                      indukOrganisasiId={satkerId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jumlahDibayar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Dibayar</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="[1000000000]"
                      {...field}
                      value={field.value?.toString() ?? 0}
                    />
                  </FormControl>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(Number(jumlahDibayarValue))}
                  </span>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nomor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tanggal"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabelWithCatatan label="Tanggal Sp2d" catatan="" />
                  <FormControl>
                    <BasicDatePicker
                      inputReadOnly={true}
                      name={field.name}
                      error={errors.tanggal}
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

            <CummulativeErrors errors={errors} />

            <div
              className={cn(
                "flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6"
              )}
            >
              <Button type="submit">Simpan</Button>
              <Button type="button" variant={"outline"} onClick={onCancel}>
                Batal
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormSp2d;
