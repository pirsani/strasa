"use client";
//import SelectKota from "@/components/form/select-kota";
import { Button } from "@/components/ui/button";

import { simpanDataSbmTransporJakartaKeKotaKabSekitar } from "@/actions/sbm/transpor";
import SelectKotaSekitarJakarta from "@/components/form/select-kota-sekitar-jakarta";
import SelectTahun from "@/components/form/select-tahun";
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
  SbmTransporJakartaKeKotaKabSekitar,
  sbmTransporJakartaKeKotaKabSekitarSchema,
} from "@/zod/schemas/transpor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormSbmTransporJakartaKeKotaKabSekitarProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: boolean) => void;
  className?: string;
  sbmTransporJakartaKeKotaKabSekitar?: Partial<SbmTransporJakartaKeKotaKabSekitar>;
}
const FormSbmTransporJakartaKeKotaKabSekitar = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  sbmTransporJakartaKeKotaKabSekitar: initialData = {},
}: FormSbmTransporJakartaKeKotaKabSekitarProps) => {
  const form = useForm<SbmTransporJakartaKeKotaKabSekitar>({
    resolver: zodResolver(sbmTransporJakartaKeKotaKabSekitarSchema),
    defaultValues: {
      tahun: new Date().getFullYear(),
      besaran: 0,
      ...initialData,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: SbmTransporJakartaKeKotaKabSekitar) => {
    try {
      const sbmTransporJakartaKeKotaKabSekitar =
        await simpanDataSbmTransporJakartaKeKotaKabSekitar(data);
      if (sbmTransporJakartaKeKotaKabSekitar.success) {
        toast.success(
          `Berhasil menyimpan data SBM  Transpor Jakarta Ke Kota Kab Sekitar`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(sbmTransporJakartaKeKotaKabSekitar.success);
    } catch (error) {
      toast.error("Gagal menyimpan data sbmTransporJakartaKeKotaKabSekitar");
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
              name="kotaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kota/Kab</FormLabel>
                  <FormControl>
                    <SelectKotaSekitarJakarta
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
            <FormField
              control={form.control}
              name="besaran"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Besaran</FormLabel>
                  <FormControl>
                    <FormControl>
                      <Input placeholder="1700000 [A-Z]" {...field} />
                    </FormControl>
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

export default FormSbmTransporJakartaKeKotaKabSekitar;
