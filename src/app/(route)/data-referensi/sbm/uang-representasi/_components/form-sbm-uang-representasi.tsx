"use client";
import { simpanDataSbmUangRepresentasi } from "@/actions/sbm/uang-representasi";
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
import {
  SbmUangRepresentasi,
  sbmUangRepresentasiSchema,
} from "@/zod/schemas/sbm-uang-representasi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectPejabatEselon2keAtas = dynamic(
  () => import("@/components/form/select-pejabat"),
  { ssr: false, loading: () => <p>Loading pejabat...</p> }
);

interface FormSbmUangRepresentasiProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  sbmUangRepresentasi?: Partial<SbmUangRepresentasi>;
}
const FormSbmUangRepresentasi = ({
  onCancel,
  handleFormSubmitComplete = () => {},
  className,
  sbmUangRepresentasi,
}: FormSbmUangRepresentasiProps) => {
  const form = useForm<SbmUangRepresentasi>({
    resolver: zodResolver(sbmUangRepresentasiSchema),
    defaultValues: {
      satuan: "OH",
      luarKota: 0,
      dalamKota: 0,
      tahun: new Date().getFullYear(), // Get the current year
    },
  });

  const { handleSubmit } = form;
  const onSubmit = async (data: SbmUangRepresentasi) => {
    try {
      const kelas = await simpanDataSbmUangRepresentasi(data);
      if (kelas.success) {
        toast.success("Berhasil menyimpan data kelas");
        handleFormSubmitComplete(true);
      } else {
        toast.error(kelas.message);
      }
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
              name="pejabatId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Pejabat</FormLabel>
                  <FormControl>
                    <SelectPejabatEselon2keAtas
                      onChange={field.onChange}
                      inputId={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="satuan"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Satuan</FormLabel>
                  <FormControl>
                    <Input placeholder="OH" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="luarKota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luar Kota</FormLabel>
                  <FormControl>
                    <Input placeholder="10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dalamKota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dalam lebih dari 8 Jam</FormLabel>
                  <FormControl>
                    <Input placeholder="10000" {...field} />
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
                    <Input placeholder="2024" {...field} />
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

export default FormSbmUangRepresentasi;
