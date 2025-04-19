import FormPeserta from "@/app/(route)/data-referensi/peserta/_components/form-peserta";
import { PesertaForEditing } from "@/zod/schemas/peserta";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Peserta } from "@/zod/schemas/peserta";

interface EditPesertaProps {
  peserta: PesertaForEditing | null;
  isEditing?: boolean;
  closeDialog?: () => void;
}
const EditPeserta = ({
  peserta,
  isEditing,
  closeDialog = () => {},
}: EditPesertaProps) => {
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

  const handleOnSaveSuccess = (data: Peserta) => {
    closeDialog();
  };

  if (!peserta) {
    return null;
  }

  return (
    <Dialog open={isEditing} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Peserta</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk mengubah data peserta
          </DialogDescription>
        </DialogHeader>
        <FormPeserta
          onCancel={onCancel}
          onSaveSuccess={handleOnSaveSuccess}
          peserta={peserta}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditPeserta;
