import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Jadwal } from "@/zod/schemas/jadwal";
import { Calendar, Plus } from "lucide-react";
import { useState } from "react";
import FormJadwal from "./form-jadwal";

interface TambahJadwalContainerProps {
  kegiatanId: string;
  onSuccess?: () => void;
}

const TambahJadwalContainer = ({
  kegiatanId,
  onSuccess = () => {},
}: TambahJadwalContainerProps) => {
  const [open, setOpen] = useState(false);

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault(); // Prevent the default behavior of closing the dialog
  };

  const handleOnSuccess = (data: Jadwal) => {
    // call parent on success
    onSuccess();
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
        className="flex flex-col w-full sm:min-w-[750px] max-h-[calc(100vh-50px)]"
        onEscapeKeyDown={handleEscapeKeyDown}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Jadwal Kelas Pengajar</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan jadwal kelas pengajar
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full h-full overflow-auto px-4">
          <FormJadwal
            onCancel={() => setOpen(false)}
            onSuccess={handleOnSuccess}
            kegiatanId={kegiatanId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TambahJadwalContainer;
