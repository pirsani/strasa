"use client";
import { simpanDataPagu } from "@/actions/pagu";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";

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
import { Pagu as ZPagu, paguSchema } from "@/zod/schemas/pagu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormPaguProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  pagu?: Partial<ZPagu> | null;
  satkerId?: string;
}
const FormPagu = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  pagu,
  satkerId,
}: FormPaguProps) => {
  const form = useForm<ZPagu>({
    resolver: zodResolver(paguSchema),
    defaultValues: pagu || {
      pagu: BigInt(0), // Set default value as BigInt,
    },
  });

  const { handleSubmit, watch } = form;
  const paguValue = watch("pagu");

  const onSubmit = async (data: ZPagu) => {
    try {
      const pagu = await simpanDataPagu(data);
      if (pagu.success) {
        toast.success(
          `Berhasil menyimpan data pagu ${pagu.data?.unitKerja.nama}`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(pagu.success);
    } catch (error) {
      toast.error("Gagal menyimpan data pagu");
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
              name="pagu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pagu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="[1000000000]"
                      {...field}
                      value={field.value?.toString() ?? 0}
                    />
                  </FormControl>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(Number(paguValue))}
                  </span>
                  <FormMessage />
                </FormItem>
              )}
            />

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

export default FormPagu;
