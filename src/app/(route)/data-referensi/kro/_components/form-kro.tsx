"use client";
import { simpanDataKro } from "@/actions/kro";
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
import { Kro, kroSchema } from "@/zod/schemas/kro";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormKroProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  kro?: Partial<Kro>;
  kegiatanId?: string;
}
const FormKro = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  kro,
  kegiatanId,
}: FormKroProps) => {
  const form = useForm<Kro>({
    resolver: zodResolver(kroSchema),
    defaultValues: {
      kode: "",
      nama: "",
      tahun: new Date().getFullYear(),
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Kro) => {
    try {
      const kro = await simpanDataKro(data);
      if (kro.success) {
        toast.success(
          `Berhasil menyimpan data kro ${kro.data?.kode} ${kro.data?.nama}`
        );
        form.reset();
      }
      handleFormSubmitComplete?.(kro.success);
    } catch (error) {
      toast.error("Gagal menyimpan data kro");
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
                    <Input placeholder="1234.EBA SOMETHING" {...field} />
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
                    <Input placeholder="..." {...field} />
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
                    <Input placeholder="2025" {...field} />
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

export default FormKro;
