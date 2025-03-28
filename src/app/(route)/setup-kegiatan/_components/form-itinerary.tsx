"use client";
import { Button } from "@/components/ui/button";

import CummulativeErrors from "@/components/form/cummulative-error";
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
import isDateLte from "@/utils/date";
import { Itinerary, itinerarySchema } from "@/zod/schemas/itinerary";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useEffect } from "react";
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
  tanggalTiba?: Date;
  onCancel?: () => void;
  simpanDataItinerary?: (data: Itinerary) => void;
  className?: string;
  itinerary?: Partial<Itinerary> | null;
}
const FormItinerary = ({
  tanggalMulai: initTanggalMulai = new Date(),
  tanggalTiba: initTanggalTiba = new Date(),
  onCancel,
  simpanDataItinerary,
  className,
  itinerary,
}: FormItineraryProps) => {
  const form = useForm<Itinerary>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: itinerary ?? {
      id: createId(),
      tanggalMulai: initTanggalMulai,
      tanggalTiba: new Date(
        initTanggalTiba.setDate(initTanggalMulai.getDate() + 1)
      ),
      dariLokasiId: "",
      dariLokasi: "",
      keLokasiId: "",
      keLokasi: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    getValues,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const setNextItineraryFrom = (lastItinerary: Itinerary) => {
    // add date plus 1 day
    const tanggalMulai = new Date(
      lastItinerary.tanggalSelesai || lastItinerary.tanggalTiba
    );
    const tanggalTiba = new Date(tanggalMulai);
    //console.log("lastItinerary", lastItinerary);
    //console.log("tanggalMulai", tanggalMulai.setDate(1));
    tanggalTiba.setDate(tanggalMulai.getDate() + 1);

    reset({
      id: createId(),
      tanggalMulai: tanggalMulai,
      tanggalTiba: tanggalTiba,
      dariLokasiId: lastItinerary.keLokasiId,
      dariLokasi: lastItinerary.keLokasi,
      keLokasiId: "",
      keLokasi: "",
    });
  };

  const tanggalMulai = form.watch("tanggalMulai");
  const tanggalTiba = form.watch("tanggalTiba");

  useEffect(() => {
    console.log("watch tanggalMulai", tanggalMulai, tanggalTiba);
    if (tanggalMulai && tanggalTiba) {
      const lte = isDateLte(tanggalMulai, tanggalTiba);
      if (!lte) {
        console.log("trigger validation", tanggalMulai, tanggalTiba);
        toast.warning(
          "Tanggal Mulai harus kurang dari atau sama dengan Tanggal Selesai"
        );
        setValue("tanggalTiba", tanggalMulai);
        trigger("tanggalMulai");
        trigger("tanggalTiba"); // this will trigger validation and transform the value to conform to zod schema
      } else {
        // memastikan bahwa setiap perubahan pada tanggalTiba akan memperbarui tanggalSelesai
        // nantinya akan diset ulang pada saat validasi chaining itinerary
        setValue("tanggalSelesai", tanggalTiba);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tanggalMulai, tanggalTiba]);

  const onSubmit = async (data: Itinerary) => {
    try {
      // TODO tanggal harus di dalam range
      const saveSuccess = simpanDataItinerary?.(data);
      saveSuccess && setNextItineraryFrom(data);
      console.log(data);
    } catch (error) {
      console.log("Gagal menyimpan data itinerary", error);
      //toast.error("Gagal menyimpan data itinerary");
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
                      Tanggal Berangkat
                      <RequiredLabel />
                    </FormLabel>
                    <FormControl>
                      <BasicDatePicker
                        inputReadOnly={true}
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
                name="tanggalTiba"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel htmlFor="tanggalTiba">
                      Tanggal Tiba
                      <RequiredLabel />
                    </FormLabel>
                    <FormControl>
                      <BasicDatePicker
                        inputReadOnly={true}
                        name={field.name}
                        error={errors.tanggalSelesai}
                        className="md:w-full"
                        calendarOptions={{
                          fromDate: new Date(tanggalMulai),
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
                            console.log("option", option);
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

            <CummulativeErrors errors={errors} />

            <div
              className={cn(
                "flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6"
              )}
            >
              <Button type="button" onClick={handleSubmit(onSubmit)}>
                Simpan
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
