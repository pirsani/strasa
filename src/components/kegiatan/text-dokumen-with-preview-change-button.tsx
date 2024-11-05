"use client";
import UpdateDataDukung from "@/actions/kegiatan/uang-harian/update-data-dukung";
import ButtonEye from "@/components/button-eye-open-document";
import useFileStore from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import { DokumenKegiatan } from "@prisma-honorarium/client";
import { Pencil, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import InputFileImmediateUpload from "../form/input-file-immediate-upload";
import { Button } from "../ui/button";

interface TextDokumenWithPreviewChangeButtonProps {
  label: string;
  dokumen?: DokumenKegiatan | null;
}
const TextDokumenWithPreviewChangeButton = ({
  label,
  dokumen: initialDokumen,
}: TextDokumenWithPreviewChangeButtonProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [dokumen, setDokumen] = useState<DokumenKegiatan | null>(
    initialDokumen ?? null
  );

  const url = dokumen?.dokumen
    ? `/download/dokumen-kegiatan/${dokumen?.dokumen}`
    : null;

  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };

  const ViewMode = () => {
    return (
      <div className="flex flex-row gap-1">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {dokumen?.nama || "Belum ada dokumen"}
        </span>
        <ButtonEye url={url} />
        <Button
          type="button"
          variant={"outline"}
          className={cn("border-blue-500 h-11 w-11 p-0 hover:bg-blue-300")}
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil size={18} />
        </Button>
      </div>
    );
  };

  const EditMode = () => {
    const [isUploadCompleted, setIsUploadCompleted] = useState(false);
    if (!dokumen) return null;
    const newId = createId();

    const handleSave = async () => {
      const updatedDokumen = await UpdateDataDukung(
        dokumen.kegiatanId,
        dokumen.id,
        newId
      );
      if (updatedDokumen.success) {
        toast.success("Dokumen berhasil diperbarui");
        setIsEditing(false);
        setDokumen(updatedDokumen.data);
        setUrl();
      } else {
        toast.error("Gagal menyimpan dokumen - " + updatedDokumen.message);
      }
    };

    return (
      <div className="flex flex-row gap-1">
        <InputFileImmediateUpload
          cuid={newId}
          name="dokumen"
          folder={dokumen.kegiatanId}
        />
        <Button
          type="button"
          variant={"outline"}
          className={cn("border-blue-500 h-11 w-11 p-0 hover:bg-blue-300")}
          onClick={handleSave}
        >
          <Save size={18} />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <span className="font-semibold text-sm">{label}</span>
      {isEditing ? <EditMode /> : <ViewMode />}
    </div>
  );
};

export default TextDokumenWithPreviewChangeButton;
