"use client";
import ButtonEye from "@/components/button-eye-open-document";
import useFileStore from "@/hooks/use-file-store";
import { DokumenKegiatan } from "@prisma-honorarium/client";

interface TextDokumenWithPreviewButtonProps {
  label: string;
  dokumen?: DokumenKegiatan | null;
}
const TextDokumenWithPreviewButton = ({
  label,
  dokumen,
}: TextDokumenWithPreviewButtonProps) => {
  //const fileUrl = useFileStore((state) => state.fileUrl);

  // if (!dokumen) {
  //   return <div className="text-gray-700">{label}</div>;
  // }
  const url = dokumen?.dokumen
    ? `/download/dokumen-kegiatan/${dokumen?.dokumen}`
    : null;

  const originalFilename =
    dokumen?.nama || dokumen?.dokumen || "Belum ada dokumen";

  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };

  return (
    <div className="flex flex-col">
      <span className="font-semibold text-sm">{label}</span>
      <div className="flex flex-row">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {originalFilename}
        </span>
        <ButtonEye url={url} />
        {/* <Button
          variant={"outline"}
          className="border-blue-500"
          onClick={setUrl}
        >
          <Eye size={16} className="text-blue-900" />
        </Button> */}
      </div>
    </div>
  );
};

export default TextDokumenWithPreviewButton;
