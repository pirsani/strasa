import SimpanJadwalKelasNarasumber from "@/actions/honorarium/narasumber/narasumber";
import CummulativeErrors from "@/components/form/cummulative-error";
import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
import InputFileImmediateUpload from "@/components/form/input-file-immediate-upload";
import RequiredLabel from "@/components/form/required";
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
import useFileStore from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { Jadwal, jadwalSchema } from "@/zod/schemas/jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SelectKelas from "./select-kelas";
import SelectMateri from "./select-materi";
import SelectNarasumber from "./select-narasumber";

interface FormJadwalProps {
  kegiatanId: string;
  onCancel?: () => void;
  onSuccess?: (data: Jadwal) => void;
}
const FormJadwal = ({
  kegiatanId,
  onCancel = () => {},
  onSuccess = () => {},
}: FormJadwalProps) => {
  const generateCuids = () => ({
    id: createId(),
    dokumenDaftarHadirCuid: "daftarHadir" + createId() + ".pdf",
    dokumenUndanganNarasumberCuid: "undangan" + createId() + ".pdf",
  });
  const form = useForm<Jadwal>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      kegiatanId,
      tanggal: new Date(),
      narasumberIds: [],
      kelasId: "",
      materiId: "",
      dokumenKonfirmasiNarasumber: [],
      ...generateCuids(),
    },
  });

  const [isDaftarHadirUploaded, setIsDaftarHadirUploaded] = useState(false);
  const [
    isDokumenUndanganNarasumberUploaded,
    setIsDokumenUndanganNarasumberUploaded,
  ] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const {
    setValue,
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const jadwalId = form.watch("id");
  const dokumenDaftarHadirCuid = form.watch("dokumenDaftarHadirCuid");
  const dokumenUndanganNarasumberCuid = form.watch(
    "dokumenUndanganNarasumberCuid"
  );
  const dokumenKonfirmasiNarasumber = form.watch("dokumenKonfirmasiNarasumber");

  const [narasumberSelected, setNarasumberSelected] = useState<string[]>([]);

  const handleNarasumberChange = (narasumbers?: string[] | string | null) => {
    if (narasumbers) {
      console.log(narasumbers);
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

  const handleReset = () => {
    setNarasumberSelected([]);

    reset({
      kegiatanId,
      tanggal: new Date(),
      narasumberIds: [],
      dokumenKonfirmasiNarasumber: [],
      kelasId: "",
      materiId: "",
      ...generateCuids(), // regenerate new cuids here
    });
  };

  // Use a ref to store the folderCuid
  // const folderCuidRef = useRef(createId());
  // const folderCuid = folderCuidRef.current;
  // setValue("cuid", folderCuid);

  const setFileUrl = useFileStore((state) => state.setFileUrl);

  const handleFileChange = (file: File | null) => {
    // if (file !== null) {
    //   const fileUrl = URL.createObjectURL(file);
    //   console.log(fileUrl);
    //   setFileUrl(fileUrl);
    // } else {
    //   setFileUrl(null);
    // }
  };

  const handleFileUploadCompleted = (field: string) => {
    console.log("File uploaded", field);
    if (field === "dokumenDaftarHadir") {
      setIsDaftarHadirUploaded(true);
    } else if (field === "dokumenUndanganNarasumber") {
      setIsDokumenUndanganNarasumberUploaded(true);
    }
  };

  const handleFileUploadDokumenKonfirmasiCompleted = (field: string) => {
    const narasumberId = field.split("-")[0] + ".pdf";
    console.log("File uploaded", field, narasumberId);
    setValue("dokumenKonfirmasiNarasumber", [
      ...dokumenKonfirmasiNarasumber,
      narasumberId,
    ]);
    trigger("dokumenKonfirmasiNarasumber");
  };

  const onSubmit = async (data: Jadwal) => {
    const {
      dokumenDaftarHadir,
      dokumenUndanganNarasumber,
      ...jadwalWithoutFile
    } = data;
    console.log(data);
    console.log(jadwalWithoutFile);
    const jadwal = await SimpanJadwalKelasNarasumber(jadwalWithoutFile);
    if (jadwal.success) {
      handleReset();
      toast.success("Jadwal berhasil disimpan");
      // call parent on success
      onSuccess(data);
    } else {
      toast.error(jadwal.error);
    }
  };

  useEffect(() => {
    if (isDaftarHadirUploaded && isDokumenUndanganNarasumberUploaded) {
      setIsReadyToSubmit(true);
    } else {
      setIsReadyToSubmit(false);
    }
  }, [isDaftarHadirUploaded, isDokumenUndanganNarasumberUploaded]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full"
      >
        <div className="flex flex-row gap-2">
          <FormField
            control={control}
            name="tanggal"
            render={({ field }) => (
              <FormItem className="w-64">
                <FormLabel htmlFor="tanggal">
                  Tanggal <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <InputDatePicker
                    name={field.name}
                    error={errors.tanggal}
                    className="md:w-full"
                    calendarOptions={{
                      fromDate: new Date(new Date().getFullYear(), 0, 1),
                      toDate: new Date(new Date().getFullYear(), 11, 31),
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="kelasId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel htmlFor="kelasId">
                  Kelas
                  <RequiredLabel />
                </FormLabel>
                <FormControl>
                  <SelectKelas
                    inputId={field.name}
                    onChange={field.onChange}
                    value={field.value}
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
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="materiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="materiId">
                Materi
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <SelectMateri
                  inputId={field.name}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="narasumberIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="narasumberIds">
                Narasumber
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

        {narasumberSelected.map((dokumen, index) => (
          <div className="flex flex-col gap-2" key={dokumen}>
            <Label className="">
              Konfirmasi kesediaan {dokumen.split("-")[1]}
            </Label>
            <InputFileImmediateUpload
              cuid={dokumen.split("-")[0]}
              folder={kegiatanId + "/" + jadwalId}
              name={dokumen}
              onFileUploadComplete={handleFileUploadDokumenKonfirmasiCompleted}
            />
          </div>
        ))}

        <FormField
          control={control}
          name="dokumenDaftarHadir"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenDaftarHadir">
                Daftar Hadir
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={dokumenDaftarHadirCuid}
                  folder={kegiatanId + "/" + jadwalId}
                  name={field.name}
                  onFileChange={handleFileChange}
                  onFileUploadComplete={handleFileUploadCompleted}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="dokumenUndanganNarasumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenUndanganNarasumber">
                Surat/Nodin/Memo Undangan Narsum
                <RequiredLabel />
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={dokumenUndanganNarasumberCuid}
                  folder={kegiatanId + "/" + jadwalId}
                  name={field.name}
                  onFileChange={handleFileChange}
                  onFileUploadComplete={handleFileUploadCompleted}
                  className="bg-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <CummulativeErrors errors={errors} verbose={false} />
        <div
          className={cn("flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6")}
        >
          <Button type="submit" disabled={!isReadyToSubmit}>
            Simpan
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Tutup
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormJadwal;
