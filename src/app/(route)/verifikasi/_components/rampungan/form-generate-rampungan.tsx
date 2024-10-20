"use client";
import { KegiatanWithDetail } from "@/actions/kegiatan";
import { generateSpd, updateStatusRampungan } from "@/actions/kegiatan/proses";
import RequiredLabel from "@/components/form/required";
import SelectBendahara from "@/components/form/select-bendahara";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Spd, spdSchema } from "@/zod/schemas/spd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

interface FormGenerateRampunganProps {
  kegiatan: KegiatanWithDetail | null;
  handleSelesai?: (kegiatan: KegiatanWithDetail) => void;
  handleGenerate?: () => void;
}
const FormGenerateRampungan = ({
  kegiatan,
  handleGenerate = () => {},
  handleSelesai = () => {},
}: FormGenerateRampunganProps) => {
  const form = useForm<Spd>({
    resolver: zodResolver(spdSchema),
    defaultValues: {
      ppkId: kegiatan?.ppkId || "",
      kegiatanId: kegiatan?.id || "",
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  if (!kegiatan) return null;

  // destructure kegiatan
  const { id: kegiatanId, riwayatPengajuan } = kegiatan;

  // Check if there's an existing pengajuan rampungan
  const pengajuanRampungan = riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "GENERATE_RAMPUNGAN"
  );

  // Render the form if GENERATE_RAMPUNGAN is selected and there's pengajuan rampungan with status SUBMITTED
  if (!pengajuanRampungan || pengajuanRampungan.status !== "SUBMITTED")
    return null;

  const handleClickSelesai = async () => {
    const updateStatus = await updateStatusRampungan(kegiatanId, "END");
    if (updateStatus.success) {
      handleSelesai(updateStatus.data);
      console.log("[updateStatus]", updateStatus);
    }
  };

  const onSubmit = async (data: Spd) => {
    console.log("[data]", data);
    //update existing kegiatan
    const updateStatus = await generateSpd(data);
    if (updateStatus.success) {
      handleGenerate();
      window.open(`/download/dokumen-rampungan/${kegiatanId}`, "_blank"); // Open new window
    }
    // if (updateStatus.success) {
    //   handleSelesai(updateStatus.data);
    //   console.log("[updateStatus]", updateStatus);
    // }
  };
  return (
    <div className="flex flex-col w-full gap-2">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="ppkId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    PPK <RequiredLabel />
                  </FormLabel>
                  <FormControl>
                    <SelectBendahara
                      fieldName={field.name}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="akun"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col">
                  <FormLabel>Pembebanan anggaran - Akun</FormLabel>
                  <FormControl>
                    <Input {...field} className={cn("w-full")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col">
                  <FormLabel>Keterangan SPD</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className={cn("w-full")}
                      placeholder="nomor surat tugas:... tanggal ..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-row gap-4 w-full mt-10">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="grow bg-blue-600 hover:bg-blue-700"
                // onClick={onSubmit}
              >
                Generate SPD{" "}
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  ""
                )}
              </Button>
              <Button
                type="button"
                variant={"destructive"}
                onClick={handleClickSelesai}
              >
                Selesai
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormGenerateRampungan;
