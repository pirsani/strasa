import { updateNarasumber } from "@/actions/narasumber";
import FormNarasumber from "@/components/form/form-narasumber";
import { NarasumberForEditing } from "@/zod/schemas/narasumber";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Narasumber } from "@/zod/schemas/narasumber";
import { toast } from "sonner";

interface EditNarasumberProps {
  narasumber: NarasumberForEditing | null;
  isEditing?: boolean;
  closeDialog?: () => void;
}
const EditNarasumber = ({
  narasumber,
  isEditing,
  closeDialog = () => {},
}: EditNarasumberProps) => {
  const onCancel = () => {
    closeDialog();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      closeDialog();
    }
  };

  // Type guard to check if a value is a Date object
  const isDate = (value: any): value is Date => value instanceof Date;

  const onSubmit = async (data: Narasumber) => {
    try {
      const { dokumenPeryataanRekeningBerbeda, ...dataWithoutFile } = data;

      if (!narasumber) {
        console.error("Narasumber data is missing.");
        toast.error("Data narasumber tidak ditemukan.");
        return;
      }

      // Call API to save the data
      const simpan = await updateNarasumber(dataWithoutFile, narasumber.id);

      // Handle API response
      if (!simpan.success) {
        console.error("Error saving narasumber:", simpan.error);
        toast.error(`Gagal menyimpan narasumber: ${simpan.message}`);
      } else {
        toast.success("Berhasil menyimpan narasumber");
        console.log("Berhasil menyimpan narasumber:", data);
        closeDialog();
      }
    } catch (error) {
      // Generic error handling
      console.error("An error occurred while saving narasumber:", error);
      toast.error("Terjadi kesalahan, gagal menyimpan data.");
    } finally {
      //
    }
  };

  if (!narasumber) {
    return null;
  }

  return (
    <Dialog open={isEditing} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Narasumber</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk mengubah data narasumber
          </DialogDescription>
        </DialogHeader>
        <FormNarasumber
          onCancel={onCancel}
          onSubmit={onSubmit}
          narasumber={narasumber}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditNarasumber;
