import CummulativeErrors from "@/components/form/cummulative-error";
import InputDatePicker from "@/components/form/date-picker/input-date-picker";
import FormFileImmediateUpload from "@/components/form/form-file-immediate-upload";
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
import useFileStore from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { Jadwal, jadwalSchema } from "@/zod/schemas/jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import SelectKelas from "./select-kelas";
import SelectMateri from "./select-materi";
import SelectNarasumber from "./select-narasumber";

interface FormJadwalProps {
  kegiatanId: string;
  onCancel?: () => void;
  onSubmit?: (data: Jadwal) => void;
}
const FormJadwal = ({
  kegiatanId,
  onCancel = () => {},
  onSubmit = () => {},
}: FormJadwalProps) => {
  const form = useForm<Jadwal>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      id: createId(),
      kegiatanId,
      tanggal: new Date(),
      dokumenDaftarHadirCuid: "daftarHadir" + createId() + ".pdf",
      dokumenSuratCuid: "surat" + createId() + ".pdf",
    },
  });

  const [isDaftarHadirUploaded, setIsDaftarHadirUploaded] = useState(false);
  const [isSuratUploaded, setIsSuratUploaded] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const {
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const jadwalId = form.watch("id");
  const dokumenDaftarHadirCuid = form.watch("dokumenDaftarHadirCuid");
  const dokumenSuratCuid = form.watch("dokumenSuratCuid");

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
    } else if (field === "dokumenSurat") {
      setIsSuratUploaded(true);
    }
  };

  useEffect(() => {
    if (isDaftarHadirUploaded && isSuratUploaded) {
      setIsReadyToSubmit(true);
    } else {
      setIsReadyToSubmit(false);
    }
  }, [isDaftarHadirUploaded, isSuratUploaded]);

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
                <FormLabel htmlFor="tanggal">Tanggal</FormLabel>
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
                <FormLabel htmlFor="kelasId">Kelas</FormLabel>
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
        </div>

        <FormField
          control={control}
          name="materiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="materiId">Materi</FormLabel>
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
              <FormLabel htmlFor="narasumberIds">Narasumber</FormLabel>
              <FormControl>
                <SelectNarasumber
                  isMulti
                  inputId={field.name}
                  onChange={field.onChange}
                  values={field.value}
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
              <FormLabel>Jumlah Jam Pelajaran</FormLabel>
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

        <FormField
          control={control}
          name="dokumenDaftarHadir"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenDaftarHadir">Daftar Hadir</FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={jadwalId}
                  folder={dokumenDaftarHadirCuid}
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
          name="dokumenSurat"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="dokumenSurat">
                Surat/Nodin/Memo Undangan Narsum
              </FormLabel>
              <FormControl>
                <FormFileImmediateUpload
                  cuid={jadwalId}
                  folder={dokumenSuratCuid}
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
        <CummulativeErrors errors={errors} verbose />
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
