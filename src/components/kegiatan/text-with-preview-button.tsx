"use client";
import ButtonEye from "@/components/button-eye-open-document";
import useFileStore from "@/hooks/use-file-store";

interface TextWithPreviewButtonProps {
  label: string;
  fileName?: string | null;
  url?: string | null;
}
const TextWithPreviewButton = ({
  label,
  fileName,
  url,
}: TextWithPreviewButtonProps) => {
  if (!url) {
    return <div className="text-gray-700">{label}</div>;
  }

  const setUrl = () => {
    useFileStore.setState({ fileUrl: url });
  };

  return (
    <div className="flex flex-col">
      <span className="font-semibold text-sm">{label}</span>
      <div className="flex flex-row">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {fileName || url || label}
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

export default TextWithPreviewButton;
