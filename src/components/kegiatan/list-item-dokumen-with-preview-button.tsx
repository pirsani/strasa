"use client";
import ButtonEye from "@/components/button-eye-open-document";
import useFileStore from "@/hooks/use-file-store";
import { DokumenKegiatan } from "@prisma-honorarium/client";

interface TextDokumenWithPreviewButtonProps {
  dokumen?: DokumenKegiatan | null;
}
const ListItemDokumenWithPreviewButton = ({
  dokumen,
}: TextDokumenWithPreviewButtonProps) => {
  //const fileUrl = useFileStore((state) => state.fileUrl);

  if (!dokumen) {
    return <div className="text-gray-700">document not found</div>;
  }
  const url = `/download/dokumen-kegiatan/${dokumen.dokumen}`;

  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };

  return (
    <div className="flex flex-row bg-gray-200 ">
      <span className="bg-gray-100 hover:bg-gray-200  rounded p-2 w-full">
        {dokumen.dokumen}
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
  );
};

export default ListItemDokumenWithPreviewButton;
