import { KegiatanEditMode } from "@/zod/schemas/kegiatan";
import FormKegiatanEdit from "../../../_components/form-kegiatan-edit";

interface SetupKegiatanEditContainerProps {
  editId?: string | null;
  kegiatan?: KegiatanEditMode;
}
const SetupKegiatanEditContainer = ({
  editId,
  kegiatan,
}: SetupKegiatanEditContainerProps) => {
  //const editId = null;
  return (
    <div>
      <FormKegiatanEdit editId={editId} kegiatan={kegiatan} />
    </div>
  );
};

export default SetupKegiatanEditContainer;
