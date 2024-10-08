import simpanNarasumber from "@/actions/narasumber";
import FormNarasumber from "@/components/form/form-narasumber";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Narasumber } from "@/zod/schemas/narasumber";
import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TambahNarasumber = () => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  // Type guard to check if a value is a Date object
  const isDate = (value: any): value is Date => value instanceof Date;

  const onSubmit = async (data: Narasumber) => {
    try {
      const formData = new FormData();
      const { dokumenPeryataanRekeningBerbeda, ...dataWithoutFile } = data;

      // Append non-file fields to formData
      for (const [key, value] of Object.entries(dataWithoutFile)) {
        if (value !== null && value !== undefined) {
          // type inputan tidak ada date, jadi g perlu cek date
          if (typeof value === "string") {
            formData.append(key, value);
          } else {
            formData.append(key, JSON.stringify(value));
          }
        } else {
          // karena pada prisma boleh null, maka yg null g perlu di append
          console.warn(`Field '${key}' is null or undefined, skipping...`);
        }
      }

      // Append the file field (check if file is provided)
      // file di treat berbeda, karena file tidak bisa di stringify
      if (dokumenPeryataanRekeningBerbeda) {
        formData.append(
          "dokumenPeryataanRekeningBerbeda",
          dokumenPeryataanRekeningBerbeda
        );
      } else {
        console.warn("No file provided for 'dokumenPeryataanRekeningBerbeda'.");
      }

      // Call API to save the data
      console.log("Saving narasumber data:", data);
      console.log("Saving narasumber formData:", formData);
      const simpan = await simpanNarasumber(formData);

      // Handle API response
      if (!simpan.success) {
        console.error("Error saving narasumber:", simpan.error);
        toast.error(`Gagal menyimpan narasumber: ${simpan.message}`);
      } else {
        toast.success("Berhasil menyimpan narasumber");
        console.log("Berhasil menyimpan narasumber:", data);
        setOpen(false);
      }
    } catch (error) {
      // Generic error handling
      console.error("An error occurred while saving narasumber:", error);
      alert("Terjadi kesalahan, gagal menyimpan data.");
    } finally {
      //
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-44">
          <Plus size={18} />
          <GraduationCap size={18} />
          <span className="hidden sm:block">Narasumber</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Narasumber</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan narasumber baru
          </DialogDescription>
        </DialogHeader>
        <FormNarasumber onCancel={onCancel} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default TambahNarasumber;
