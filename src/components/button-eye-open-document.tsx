import useFileStore from "@/hooks/use-file-store";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { Button } from "./ui/button";

interface ButtonEyeProps {
  url: string | null;
}
const ButtonEye = ({ url }: ButtonEyeProps) => {
  // Access state and actions from the store
  const { isPreviewHidden, showPreview } = useFileStore((state) => ({
    isPreviewHidden: state.isPreviewHidden,
    showPreview: state.showPreview,
  }));

  const setUrl = () => {
    console.log("setUrl", url);
    if (url === "") return;
    useFileStore.setState({ fileUrl: url });
    showPreview();
  };

  const { fileUrl } = useFileStore();

  if (!url) return null;
  if (url === "") return null;
  return (
    <Button
      type="button"
      variant={"outline"}
      className={cn(
        "border-blue-500 h-11 w-11 p-0 hover:bg-blue-300",
        fileUrl === url && "bg-blue-500 text-white"
      )}
      onClick={setUrl}
    >
      <Eye size={18} />
    </Button>
  );
};

export default ButtonEye;
