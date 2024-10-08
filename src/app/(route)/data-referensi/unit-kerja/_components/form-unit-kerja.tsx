"use client";
import { simpanDataUnitKerja } from "@/actions/unit-kerja";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import SelectUnitKerja from "@/components/form/select-unit-kerja";
import { Checkbox } from "@/components/ui/checkbox";
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
import { UnitKerja, unitKerjaSchema } from "@/zod/schemas/unit-kerja";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormUnitKerjaProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  unitKerja?: Partial<UnitKerja> | null;
}
const FormUnitKerja = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  unitKerja,
}: FormUnitKerjaProps) => {
  const form = useForm<UnitKerja>({
    resolver: zodResolver(unitKerjaSchema),
    defaultValues: unitKerja || {
      nama: "",
      singkatan: "",
      eselon: null,
      isSatkerAnggaran: false,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: UnitKerja) => {
    try {
      const unitKerja = await simpanDataUnitKerja(data);
      if (unitKerja.success) {
        toast.success(
          `Berhasil menyimpan data unitKerja ${unitKerja.data?.nama}`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(unitKerja.success);
    } catch (error) {
      toast.error("Gagal menyimpan data unitKerja");
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
              name="indukOrganisasiId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Induk Organisasi</FormLabel>
                  <FormControl>
                    <SelectUnitKerja
                      onChange={field.onChange}
                      value={field.value}
                      fieldName={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="[Direktorat .....]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="singkatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Singkatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirjen A....." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eselon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eselon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1 2 3"
                      {...field}
                      className="w-[150px]"
                      value={field.value ?? ""} // Ensure value is never null
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isSatkerAnggaran"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center  gap-2 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false} // Ensure the value is always a boolean
                      onCheckedChange={(checked) => field.onChange(checked)} // Handle the checked state properly
                      className="h-6 w-6"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                    />
                  </FormControl>
                  <FormLabel className="items-center pb-2">
                    Satker Anggaran
                  </FormLabel>
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

export default FormUnitKerja;
