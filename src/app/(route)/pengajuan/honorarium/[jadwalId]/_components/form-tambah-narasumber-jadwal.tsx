import { simpanNarasumberJadwal } from "@/actions/honorarium/narasumber/narasumber";
import { OptionSbm } from "@/actions/sbm";
import CummulativeErrors from "@/components/form/cummulative-error";
import { InputFileImmediateUpload } from "@/components/form/input-file-immediate-upload";
import { RequiredLabel } from "@/components/form/required";
import { SelectNarasumber } from "@/components/form/select-narasumber";
import { SelectSbmHonorarium } from "@/components/form/select-sbm-honorarium";
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
import { Label } from "@/components/ui/label";
import {
  formatDokumenKonfirmasiId,
  NarasumberJadwal,
  narasumberJadwalSchema,
} from "@/zod/schemas/narasumber-jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import Decimal from "decimal.js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormTambahNarasumberJadwalProps {
  kegiatanId: string;
  jadwalId: string;
  jumlahJamPelajaran: number | Decimal | null;
  optionsSbmHonorarium: OptionSbm[];
  onClose: () => void;
}

const FormTambahNarasumberJadwal = ({
  kegiatanId,
  jadwalId,
  jumlahJamPelajaran,
  optionsSbmHonorarium,
  onClose,
}: FormTambahNarasumberJadwalProps) => {
  const form = useForm<NarasumberJadwal>({
    resolver: zodResolver(narasumberJadwalSchema),
    defaultValues: {
      jadwalId: jadwalId,
      narasumberIds: [],
      dokumenKonfirmasiNarasumber: [],
      jumlahJamPelajaran: Number(jumlahJamPelajaran) || 0,
    },
  });

  const {
    setValue,
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const dokumenKonfirmasiNarasumber =
    form.watch("dokumenKonfirmasiNarasumber") || [];

  const [narasumberSelected, setNarasumberSelected] = useState<string[]>([]);

  const handleNarasumberChange = (narasumbers?: string[] | string | null) => {
    if (narasumbers) {
      // console.log(narasumbers);
      // check if narasumbers is an array
      if (Array.isArray(narasumbers)) {
        //setValue("dokumenKonfirmasiNarasumber", narasumbers);
        setNarasumberSelected(narasumbers);
      } else {
        // setValue("dokumenKonfirmasiNarasumber", [narasumbers]);
        setNarasumberSelected([narasumbers]);
      }
    }
  };

  const handleFileUploadDokumenKonfirmasiCompleted = (narsumLabel: string) => {
    const dokumenKonfirmasiNarasumberId = formatDokumenKonfirmasiId(
      narsumLabel,
      jadwalId
    );
    // console.log("File uploaded", field, narasumberId);
    setValue("dokumenKonfirmasiNarasumber", [
      ...dokumenKonfirmasiNarasumber,
      dokumenKonfirmasiNarasumberId,
    ]);
    trigger("dokumenKonfirmasiNarasumber");
  };

  const handleOnFileChange = (file: File | null, cuid?: string) => {
    if (!file) {
      console.log(`File ${cuid} is removed`);
      // Remove file from list of dokumenKonfirmasiNarasumber
      setValue(
        "dokumenKonfirmasiNarasumber",
        dokumenKonfirmasiNarasumber.filter((doc) => doc !== cuid)
      );
      return;
    }
  };

  const router = useRouter();

  const onSubmit = async (data: NarasumberJadwal) => {
    console.log("NarasumberJadwal", data);
    const simpan = await simpanNarasumberJadwal(data);
    if (simpan.success) {
      // refresh page
      router.refresh();
      onClose();
    } else {
      alert(simpan.error);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex flex-col gap-2">
          <FormField
            control={control}
            name="narasumberIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="narasumberIds">
                  Nama Narasumber
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <SelectNarasumber
                    isMulti
                    inputId={field.name}
                    onChange={(values, labels) => {
                      field.onChange(values);
                      handleNarasumberChange(labels);
                    }}
                    values={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {narasumberSelected.map((narsumLabel, index) => (
            <div className="flex flex-col gap-2" key={narsumLabel}>
              <Label className="">
                Konfirmasi kesediaan {narsumLabel.split("-")[1]}
              </Label>
              <InputFileImmediateUpload
                cuid={formatDokumenKonfirmasiId(narsumLabel, jadwalId)}
                folder={kegiatanId + "/" + jadwalId}
                name={narsumLabel}
                onFileUploadComplete={
                  handleFileUploadDokumenKonfirmasiCompleted
                }
                onFileChange={handleOnFileChange}
              />
            </div>
          ))}

          <FormField
            control={control}
            name="jenisHonorariumId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="jenisHonorariumId">
                  Jenis Honorarium
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <SelectSbmHonorarium
                    inputId={field.name}
                    optionsSbmHonorarium={optionsSbmHonorarium}
                    initialOption={null}
                    onChange={(options) => {
                      // console.log(options);
                      field.onChange(options?.value);
                    }}
                    isDisabled={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="jumlahJamPelajaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Jumlah JP
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <Input
                    name={field.name}
                    className="md:w-full"
                    type="number"
                    step={0.1}
                    min={0}
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <CummulativeErrors errors={errors} verbose={false} />
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Form>
  );
};

export default FormTambahNarasumberJadwal;
