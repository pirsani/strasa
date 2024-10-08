import { cn } from "@/lib/utils";
import { createId } from "@paralleldrive/cuid2";
import axios from "axios";
import { Check, CircleX, List } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Progress } from "./progress";

interface FormMultiFileUploadProps {
  name: string;
  filePrefix?: string;
  cuids?: string;
  folder?: string;
  onFileChange?: (files: File[] | null) => void;
  className?: string;
  classNameEyeButton?: string;
  text?: string;
}

interface FileMap {
  [key: string]: {
    file: File;
    uploading: boolean;
    progress: number;
    filename: string;
  };
}

export const FormMultiFileUpload = ({
  name,
  filePrefix = "",
  cuids,
  folder = "",
  onFileChange,
  className,
  classNameEyeButton,
  text = "Add Files",
}: FormMultiFileUploadProps) => {
  const { control, watch, setValue, trigger } = useFormContext();
  const [showFiles, setShowFiles] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileMap>({}); // Store the files in a map

  // Watch the field value to display previously saved files
  //const currentFiles = (watch(name) as File[] | undefined) || [];
  const currentFiles = Object.values(files).map((fileObj) => fileObj.file);

  // Function to reset the input value
  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Function to handle file selection and merge with existing files
  const handleFileChange = async (newFiles: File[] | null) => {
    if (newFiles) {
      // Combine new files with existing files, avoiding duplicates
      const updatedFiles = [
        ...currentFiles,
        ...newFiles.filter(
          (newFile) =>
            !currentFiles.some(
              (existingFile) =>
                existingFile.name === newFile.name &&
                existingFile.size === newFile.size
            )
        ),
      ];

      // Upload each new file immediately
      for (const newFile of newFiles) {
        // sanitize the file name
        const filename = newFile.name.replace(/[^a-z0-9.]/gi, "_");
        const fileIdentifier = filename + newFile.size;
        if (!files[fileIdentifier]) {
          const ext = getFileExtension(newFile.name);
          const cuid = filePrefix + createId() + "." + ext;
          setFiles((prevFiles) => ({
            ...prevFiles,
            [fileIdentifier]: {
              file: newFile,
              uploading: true,
              progress: 0,
              filename: cuid,
            },
          }));
          try {
            const formData = new FormData();
            formData.append("file", newFile);
            formData.append("filename", cuid);
            formData.append("folder", folder);
            await axios.post("/api/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setFiles((prevFiles) => ({
                    ...prevFiles,
                    [fileIdentifier]: {
                      ...prevFiles[fileIdentifier],
                      progress: percentCompleted,
                    },
                  }));
                }
              },
            });

            setFiles((prevFiles) => ({
              ...prevFiles,
              [fileIdentifier]: {
                ...prevFiles[fileIdentifier],
                uploading: false,
              },
            }));
          } catch (error) {
            console.error("[ERROR UPLOAD]", error);
            console.error("File upload failed:", error);
            setFiles((prevFiles) => {
              const newFiles = { ...prevFiles };
              delete newFiles[fileIdentifier];
              return newFiles;
            });
          }
        }
      }

      setValue(name, updatedFiles);

      onFileChange && onFileChange(updatedFiles);
    }
    resetInput();
    trigger(name);
  };

  const handleDeleteFile = (index: number) => {
    if (currentFiles) {
      const fileToDelete = currentFiles[index];
      //const fileHash = fileToDelete.name + fileToDelete.size;

      const filename = fileToDelete.name.replace(/[^a-z0-9.]/gi, "_");
      const fileIdentifier = filename + fileToDelete.size;

      setFiles((prevFiles) => {
        const newFiles = { ...prevFiles };
        delete newFiles[fileIdentifier];
        return newFiles;
      });
      const updatedFiles = currentFiles.filter((_, i) => i !== index);
      setValue(name, updatedFiles);
      onFileChange && onFileChange(updatedFiles);

      // Delete the file from the server
      const ext = getFileExtension(fileToDelete.name);
      axios
        .delete("/api/upload/delete", {
          data: {
            filename: files[fileIdentifier].filename,
            folder: folder,
          },
        })
        .then((response) => {
          //console.log("File deleted:", response.data);
          toast.success(`File ${fileToDelete.name} deleted`);
        })
        .catch((error) => {
          toast.error("File deletion failed");
          //console.error("File deletion failed:", error);
        });
    }
    console.log("trigger", index);
    trigger(name);
  };

  useEffect(() => {
    if (cuids) {
      // loop through the files and set the cuids from filenames
      const listOffiles = Object.values(files);
      const filenames = listOffiles.map((file) => {
        return file.filename;
      });
      console.log("cuids", cuids, filenames);
      setValue(cuids, filenames);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  return (
    <div className="flex flex-col gap-2">
      <input
        id={name}
        type="file"
        accept="image/*, application/pdf"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : null;
          handleFileChange(files);
        }}
      />

      <div className="flex flex-row gap-1 items-center">
        <Button
          type="button"
          variant={"outline"}
          className={cn("shadow-lg border-2 border-gray-300", className)}
          onClick={() => inputRef.current?.click()}
        >
          {text}
        </Button>

        <Button
          type="button"
          variant={
            showFiles && currentFiles && currentFiles.length > 0
              ? "outline"
              : "outline"
          }
          onClick={() => setShowFiles(!showFiles)}
          className={cn(
            "shadow-lg border-2 border-gray-300",
            classNameEyeButton
          )}
        >
          <span className="mx-2">{currentFiles.length} file</span>
          <List
            size={16}
            className="text-blue-900"
            transform={showFiles ? "rotate(0)" : "rotate(90)"}
          />
        </Button>
      </div>

      {showFiles && currentFiles && currentFiles.length > 0 && (
        <div className="flex flex-col gap-0 w-full bg-gray-100 border border-gray-300 rounded p-1 w-full text-sm">
          {currentFiles.map((file, index) => {
            //sanitize the file name
            const filename = file.name.replace(/[^a-z0-9.]/gi, "_");
            const fileIdentifier = filename + file.size;
            return (
              <div
                key={index}
                className="flex flex-row gap-1 items-center pl-2 rounded-sm hover:bg-slate-300 odd:bg-slate-200"
              >
                <div className="flex flex-col w-full">
                  <div className="flex-row flex">
                    {files[fileIdentifier]?.progress >= 100 && (
                      <Check size={16} className="text-green-600 mx-2" />
                    )}
                    <span className="flex-1 truncate ">{file.name}</span>
                  </div>
                  <Progress
                    value={files[fileIdentifier]?.progress || 0}
                    className={cn(
                      "w-full h-[3px] rounded-sm ",
                      files[fileIdentifier]?.progress >= 100
                        ? "hidden"
                        : "bg-blue-700"
                    )}
                    indicatorClassName="bg-slate-400"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteFile(index)}
                  className="rounded-full p-1"
                >
                  <CircleX size={24} className="text-red-600" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Function to hash a string
async function hashString(str: string): Promise<string> {
  // Convert the string to an ArrayBuffer (Uint8 array)
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // Hash the array buffer using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(""); // Convert to hex string
  return hashHex;
}

function getFileExtension(filename: string) {
  return filename.split(".").pop();
}
