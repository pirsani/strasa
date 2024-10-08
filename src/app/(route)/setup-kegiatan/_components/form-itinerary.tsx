"use client";
import { Button } from "@/components/ui/button";

import BasicDatePicker from "@/components/form/date-picker/basic-date-picker";
import RequiredLabel from "@/components/form/required";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Itinerary, itinerarySchema } from "@/zod/schemas/itinerary";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SelectNegara from "./select-negara";
//import SelectSbmNegara from "./select-sbm-negara";

// const SelectSbmNegara = dynamic(() => import("./select-sbm-negara"), {
//   ssr: false,
//   loading: () => <p>Loading negara...</p>,
// });

// const SelectKegiatan = dynamic(
//   () => import("@/components/form/select-kegiatan"),
//   { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
// );

interface FormItineraryProps {
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
  onCancel?: () => void;
  simpanDataItinerary?: (data: Itinerary) => void;
  className?: string;
  itinerary?: Partial<Itinerary>;
}
const FormItinerary = ({
  tanggalMulai = new Date(),
  tanggalSelesai = new Date(),
  onCancel,
  simpanDataItinerary,
  className,
  itinerary,
}: FormItineraryProps) => {
  const form = useForm<Itinerary>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {},
  });

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: Itinerary) => {
    try {
      // TODO tanggal harus di dalam range
      simpanDataItinerary?.(data);
      reset();
      console.log(data);
    } catch (error) {
      toast.error("Gagal menyimpan data itinerary");
    }
    console.log(data);
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row w-full gap-2">
              <FormField
                control={form.control}
                name="tanggalMulai"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel htmlFor="tanggalMulai">
                      Tanggal Mulai
                      <RequiredLabel />
                    </FormLabel>
                    <FormControl>
                      <BasicDatePicker
                        name={field.name}
                        error={errors.tanggalMulai}
                        className="md:w-full"
                        calendarOptions={{
                          fromDate: new Date(new Date().getFullYear(), 0, 1),
                          toDate: new Date(new Date().getFullYear(), 11, 31),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tanggalSelesai"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel htmlFor="tanggalSelesai">
                      Tanggal Selesai
                      <RequiredLabel />
                    </FormLabel>
                    <FormControl>
                      <BasicDatePicker
                        name={field.name}
                        error={errors.tanggalSelesai}
                        className="md:w-full"
                        calendarOptions={{
                          fromDate: new Date(new Date().getFullYear(), 0, 1),
                          toDate: new Date(new Date().getFullYear(), 11, 31),
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-row w-full gap-2">
              <FormField
                control={form.control}
                name="dariLokasiId"
                render={({ field }) => {
                  const selectedOption = field.value
                    ? {
                        value: field.value,
                        label: getValues("dariLokasi") || field.value,
                      } // Adjust this to fetch the correct label if needed
                    : null;
                  return (
                    <FormItem className="w-1/2">
                      <FormLabel>Dari Lokasi</FormLabel>
                      <FormControl>
                        <SelectNegara
                          fieldName="dariLokasiId"
                          onChange={(option) => {
                            field.onChange(option ? option.value : null);
                            setValue(
                              "dariLokasi",
                              option ? option.label : null
                            );
                          }}
                          value={selectedOption}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="keLokasiId"
                render={({ field }) => {
                  const selectedOption = field.value
                    ? {
                        value: field.value,
                        label: getValues("keLokasi") || field.value,
                      } // Adjust this to fetch the correct label if needed
                    : null;
                  return (
                    <FormItem className="w-1/2">
                      <FormLabel>Ke Lokasi</FormLabel>
                      <FormControl>
                        <SelectNegara
                          fieldName="keLokasiId"
                          onChange={(option) => {
                            field.onChange(option ? option.value : null);
                            setValue("keLokasi", option ? option.label : null);
                          }}
                          value={selectedOption}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div
              className={cn(
                "flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6"
              )}
            >
              <Button type="button" onClick={handleSubmit(onSubmit)}>
                Tambah
              </Button>
              <Button type="button" variant={"outline"} onClick={onCancel}>
                Tutup
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormItinerary;
