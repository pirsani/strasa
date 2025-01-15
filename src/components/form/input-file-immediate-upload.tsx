"use client";
import { Progress } from "@/components/form/progress";
import { cn } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface InputFileImmediateUploadProps {
  name: string;
  cuid?: string;
  folder?: string;
  onFileChange?: (file: File | null) => void;
  className?: string;
  allowedTypes?: string[];
  placeholder?: string;
  onFileUploadComplete?: (name: string, file?: File | null) => void;
}

export const InputFileImmediateUpload = ({
  name,
  cuid = createId(),
  folder = "",
  onFileChange,
  onFileUploadComplete = () => {},
  className,
  allowedTypes = ["application/pdf"],
  placeholder = "No file selected, please choose a file",
}: InputFileImmediateUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [percentCompleted, setPercentCompleted] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setPercentCompleted(0);
  }, [cuid]);

  const clearFile = () => {
    setSelectedFile(null);
    onFileChange && onFileChange(null); // Notify parent component
    setPercentCompleted(0);
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the file input
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      handleImmediateUpload(file);
      onFileChange && onFileChange(file); // Notify parent component
    }
  };

  const handleImmediateUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", cuid);
    formData.append("folder", folder);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setPercentCompleted(percent);
            console.log(`File is ${percent}% uploaded.`);
          } else {
            console.log("Unable to compute progress information.");
          }
        },
      });

      if (response.status === 200) {
        toast.info(`File ${file.name} uploaded successfully:`);
        onFileUploadComplete(name, file);
      } else {
        toast.error(`File upload failed with status: ${response.status}`);
      }

      console.log("File uploaded successfully:", response.data);
    } catch (error) {
      clearFile();

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(
            "Server error:",
            error.response.status,
            error.response.data
          );
          toast.error(
            `Failed to upload ${file.name}: Server error ${error.response.status}`
          );
        } else if (error.request) {
          console.log("Network error:", error.request);
          toast.error("Network error: No response received from server");
        } else {
          console.log("Error setting up request:", error.message);
          toast.error(`Error setting up request: ${error.message}`);
        }
      } else {
        console.log("Unexpected error:", error);
        toast.error("Unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row gap-1">
        <div className="flex w-full flex-col">
          <Input
            name={`fki-${name}`}
            type="text"
            readOnly
            value={selectedFile?.name ?? ""}
            placeholder={placeholder}
            onClick={() => !selectedFile && inputRef.current?.click()}
          />
          <Progress
            value={percentCompleted}
            className="w-full h-[3px] rounded-sm -mt-[3px]"
            indicatorClassName="bg-slate-400"
          />
        </div>

        <Button
          variant="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {selectedFile ? "Change" : "Browse File"}
        </Button>

        <Button variant="outline" type="button" onClick={clearFile}>
          Clear
        </Button>
      </div>

      <input
        ref={inputRef}
        id={name}
        type="file"
        accept={allowedTypes.join(", ")}
        className={cn(
          "border-2 border-gray-300 p-2 rounded w-full hidden",
          className
        )}
        onChange={handleChange}
      />
    </div>
  );
};

export default InputFileImmediateUpload;
