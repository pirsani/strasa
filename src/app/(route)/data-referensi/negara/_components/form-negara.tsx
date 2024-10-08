"use client";
import { simpanDataNegara } from "@/actions/negara";
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
import { Negara, negaraSchema } from "@/zod/schemas/negara";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface FormNegaraProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  negara?: Partial<Negara>;
}
const FormNegara = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  negara,
}: FormNegaraProps) => {
  const form = useForm<Negara>({
    resolver: zodResolver(negaraSchema),
    defaultValues: {
      nama: "",
      namaInggris: "",
      kodeAlpha2: "",
      kodeAlpha3: "",
      kodeNumeric: "",
      urutan: 999,
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: Negara) => {
    console.log(data);
    try {
      const negara = await simpanDataNegara(data);
      if (negara.success) {
        toast.success(
          `Berhasil menyimpan data negara ${negara.data?.kodeAlpha3} ${negara.data?.nama}`
        );
        form.reset();
        handleFormSubmitComplete?.(negara.success);
      } else {
        toast.error(
          `Gagal menyimpan data negara ${data.nama} ${data.kodeAlpha3}, ${negara.message}`
        );
      }
    } catch (error) {
      toast.error("Gagal menyimpan data negara");
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
              name="namaInggris"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Nama(EN)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nama (EN)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col md:flex-row gap-1">
              <FormField
                control={form.control}
                name="kodeAlpha2"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Kode Alpha2</FormLabel>
                    <FormControl>
                      <Input placeholder="AX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kodeAlpha3"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Kode Alpha3</FormLabel>
                    <FormControl>
                      <Input placeholder="AXT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kodeNumeric"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Kode Numeric</FormLabel>
                    <FormControl>
                      <Input placeholder="007" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="urutan"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/3">
                  <FormLabel>Urutan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="999"
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

export default FormNegara;
