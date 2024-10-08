import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface InputFileProps {
  name: string;
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export const InputFile = ({
  name,
  onFileChange,
  className,
}: InputFileProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setCurrentFile(selectedFile);
    onFileChange && onFileChange(selectedFile);
  };

  return (
    <div className="flex flex-col gap-2">
      {currentFile && (
        <div className="flex flex-row gap-1">
          <Input type="text" readOnly value={currentFile.name} />
          <Button
            type="button"
            variant={"outline"}
            onClick={() => inputRef.current?.click()}
          >
            Choose File
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        id={name}
        type="file"
        accept=".pdf"
        className={cn(
          "border-2 border-gray-300 p-2 rounded w-full",
          className,
          currentFile && "hidden"
        )}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default InputFile;
