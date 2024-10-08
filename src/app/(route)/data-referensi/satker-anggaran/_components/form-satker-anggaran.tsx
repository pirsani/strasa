"use client";
import { setSatkerAnggaran } from "@/actions/satker-anggaran";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import SelectUnitEselon2Keatas from "@/components/form/select-unit-eselon2-keatas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  SatkerAnggaran,
  satkerAnggaranSchema,
} from "@/zod/schemas/satker-anggaran";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormSatkerAnggaranProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  satkerAnggaran?: Partial<SatkerAnggaran>;
}
const FormSatkerAnggaran = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  satkerAnggaran,
}: FormSatkerAnggaranProps) => {
  const form = useForm<SatkerAnggaran>({
    resolver: zodResolver(satkerAnggaranSchema),
    defaultValues: {
      id: "",
      isSatkerAnggaran: true,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: SatkerAnggaran) => {
    try {
      const satkerAnggaran = await setSatkerAnggaran(data, data.id);
      if (satkerAnggaran.success) {
        toast.success(
          `Berhasil menyimpan data satkerAnggaran ${satkerAnggaran.data?.nama} `
        );
        form.reset();
      }
      handleFormSubmitComplete?.(satkerAnggaran.success);
    } catch (error) {
      toast.error("Gagal menyimpan data satkerAnggaran");
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
              name="id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unit Kerja</FormLabel>
                  <FormControl>
                    <SelectUnitEselon2Keatas
                      onChange={field.onChange}
                      inputId={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div
              className={cn(
                "flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6"
              )}
            >
              <Button type="submit">Tambah</Button>
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

export default FormSatkerAnggaran;
