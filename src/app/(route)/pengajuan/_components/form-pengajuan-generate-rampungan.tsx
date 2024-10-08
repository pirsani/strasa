import { KegiatanWithDetail } from "@/actions/kegiatan";
import { pengajuanGenerateRampungan } from "@/actions/kegiatan/proses";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  telahMemerika: z.boolean().refine((val) => val === true, {
    message:
      "Anda harus menyetujui bahwa data yang anda inputkan benar sebelum melanjutkan",
  }),
});
// Define the type for the form data
type FormData = z.infer<typeof schema>;

interface FormPengajuanGenerateRampunganProps {
  kegiatanId: string | null;
  className?: string;
  handleSuccess?: (kegiatan: KegiatanWithDetail) => void;
}
const FormPengajuanGenerateRampungan = ({
  className,
  kegiatanId,
  handleSuccess = () => {},
}: FormPengajuanGenerateRampunganProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!kegiatanId) return;
    console.log("Form submitted:", data);
    const pengajuan = await pengajuanGenerateRampungan(kegiatanId);
    console.log("Pengajuan:", pengajuan);
    handleSuccess(pengajuan);
  };
  return (
    <div
      className={cn("w-full flex flex-col border border-blue-500", className)}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 p-2"
      >
        <div className="flex flex-col gap-2">
          <label>
            <input
              type="checkbox"
              {...register("telahMemerika")}
              className="p-2 m-2"
            />
            Dengan ini saya menyatakan telah memeriksa data yang saya inputkan
            dan menyatakan bahwa data tersebut benar
          </label>
          {errors.telahMemerika && (
            <p className="text-red-500">{errors.telahMemerika.message}</p>
          )}
        </div>
        <Button className="bg-blue-700 hover:bg-blue-600">Submit</Button>
      </form>
    </div>
  );
};

export default FormPengajuanGenerateRampungan;
