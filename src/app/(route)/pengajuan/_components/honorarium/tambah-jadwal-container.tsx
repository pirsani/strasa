import SimpanJadwalKelasNarasumber from "@/actions/honorarium/narasumber";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Jadwal, jadwalSchema } from "@/zod/schemas/jadwal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import FormJadwal from "./form-jadwal";

interface TambahJadwalContainerProps {
  kegiatanId: string;
}

const TambahJadwalContainer = ({ kegiatanId }: TambahJadwalContainerProps) => {
  const [open, setOpen] = useState(false);
  const form = useForm<Jadwal>({
    resolver: zodResolver(jadwalSchema),
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<Jadwal> = async (data) => {
    const { dokumenDaftarHadir, dokumenSurat, ...jadwalWithoutFile } = data;
    console.log(data);
    console.log(jadwalWithoutFile);
    const jadwal = await SimpanJadwalKelasNarasumber(jadwalWithoutFile);
    if (jadwal.success) {
      //setOpen(false);
      toast.success("Jadwal berhasil disimpan");
    } else {
      toast.error(jadwal.error);
    }
    // Call API to save data
    // Close dialog
    // setOpen(false);
  };
  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault(); // Prevent the default behavior of closing the dialog
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"default"} className="gap-1">
          <Plus size={12} />
          <span className="hidden md:block">Jadwal</span>
          <Calendar size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:min-w-[750px] max-h-[calc(100vh-100px)]"
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle>Jadwal Kelas Pengajar</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan jadwal kelas pengajar
          </DialogDescription>
        </DialogHeader>
        <FormJadwal
          onCancel={() => setOpen(false)}
          onSubmit={onSubmit}
          kegiatanId={kegiatanId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TambahJadwalContainer;
