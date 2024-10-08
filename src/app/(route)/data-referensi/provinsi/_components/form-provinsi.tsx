"use client";
import { simpanDataProvinsi } from "@/actions/provinsi";
//import SelectKegiatan from "@/components/form/select-kegiatan";
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
import { Provinsi, provinsiSchema } from "@/zod/schemas/provinsi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormProvinsiProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  provinsi?: Partial<Provinsi>;
}
const FormProvinsi = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  provinsi,
}: FormProvinsiProps) => {
  const form = useForm<Provinsi>({
    resolver: zodResolver(provinsiSchema),
    defaultValues: {
      kode: "999",
      nama: "",
      singkatan: "",
      urutan: 999,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Provinsi) => {
    try {
      const provinsi = await simpanDataProvinsi(data);
      if (provinsi.success) {
        toast.success(
          `Berhasil menyimpan data provinsi ${provinsi.data?.kode} ${provinsi.data?.nama}`
        );
        form.reset();
        handleFormSubmitComplete?.(provinsi.success);
      } else {
        toast.error(
          `Gagal menyimpan data provinsi ${data.nama} ${data.kode}, ${provinsi.message}`
        );
      }
    } catch (error) {
      toast.error("Gagal menyimpan data provinsi");
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
              name="kode"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input placeholder="99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="nama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="singkatan"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Singkatan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Singkatan"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urutan"
              render={({ field }) => (
                <FormItem className="w-full sm:w-1/3">
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="99"
                      {...field}
                      value={field.value || ""}
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

export default FormProvinsi;
