"use client";
import { simpanDataKelas } from "@/actions/kelas";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

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
import { Kelas, kelasSchema } from "@/zod/schemas/kelas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormKelasProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  kelas?: Partial<Kelas>;
}
const FormKelas = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  kelas,
}: FormKelasProps) => {
  const form = useForm<Kelas>({
    resolver: zodResolver(kelasSchema),
    defaultValues: {
      kode: "",
      nama: "",
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Kelas) => {
    try {
      const kelas = await simpanDataKelas(data);
      if (kelas.success) {
        toast.success(
          `Berhasil menyimpan data kelas ${kelas.data?.kode} ${kelas.data?.nama}`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(kelas.success);
    } catch (error) {
      toast.error("Gagal menyimpan data kelas");
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
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input placeholder="[PDK-75-A]" {...field} />
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
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Kelas [A-Z]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kegiatanId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Nama Kegiatan</FormLabel>
                  <FormControl>
                    <SelectKegiatan
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

export default FormKelas;
