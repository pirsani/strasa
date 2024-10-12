"use client";
import { simpanDataSbmTransporDalamKotaPulangPergi } from "@/actions/sbm/transpor";
import SelectTahun from "@/components/form/select-tahun";
//import SelectKota from "@/components/form/select-kota";
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
  SbmTransporDalamKotaPulangPergi,
  sbmTransporDalamKotaPulangPergiSchema,
} from "@/zod/schemas/transpor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormSbmTransporDalamKotaPulangPergiProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  sbmTransporDalamKota?: Partial<SbmTransporDalamKotaPulangPergi>;
}
const FormSbmTransporDalamKotaPulangPergi = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  sbmTransporDalamKota: initialData = {},
}: FormSbmTransporDalamKotaPulangPergiProps) => {
  const form = useForm<SbmTransporDalamKotaPulangPergi>({
    resolver: zodResolver(sbmTransporDalamKotaPulangPergiSchema),
    defaultValues: {
      tahun: new Date().getFullYear(),
      besaran: 0,
      ...initialData,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: SbmTransporDalamKotaPulangPergi) => {
    //console.log(data);
    try {
      const sbmTransporDalamKota =
        await simpanDataSbmTransporDalamKotaPulangPergi(data);
      if (sbmTransporDalamKota.success) {
        toast.success(`Berhasil menyimpan data SBM Transpor Dalam Kota `);
        form.reset();
      }
      handleFormSubmitComplete?.(sbmTransporDalamKota.success);
    } catch (error) {
      toast.error("Gagal menyimpan data sbmTransporDalamKota");
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
              name="besaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Besaran</FormLabel>
                  <FormControl>
                    <Input placeholder="170000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tahun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <FormControl>
                    <SelectTahun
                      fieldName={field.name}
                      value={field.value}
                      onChange={field.onChange}
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

export default FormSbmTransporDalamKotaPulangPergi;
