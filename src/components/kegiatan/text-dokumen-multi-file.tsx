import { DokumenKegiatan } from "@prisma-honorarium/client";
import { List } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import ListItemDokumenWithPreviewButton from "./list-item-dokumen-with-preview-button";

interface TextDokumenMultiFileProps {
  label: string;
  dokumen: DokumenKegiatan[];
}
const TextDokumenMultiFile = ({
  label,
  dokumen,
}: TextDokumenMultiFileProps) => {
  const [listOpened, setListOpened] = useState(false);
  const toggleListOpen = () => setListOpened(!listOpened);
  return (
    <div className="flex flex-col">
      <span className="text-gray-700">{label}</span>
      <div className="flex flex-row">
        <span className=" bg-gray-100 border border-gray-300 rounded p-2 w-full">
          {dokumen.length} file
        </span>
        <Button
          variant={"outline"}
          className="border-blue-500"
          onClick={toggleListOpen}
        >
          <List
            size={16}
            className="text-blue-900"
            transform={listOpened ? "rotate(90)" : "rotate(0)"}
          />
        </Button>
      </div>

      <div>
        {listOpened && dokumen.length > 0 && (
          <div className="flex flex-col mt-1 gap-1 w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 w-full">
            {dokumen.map((file, index) => {
              return (
                <ListItemDokumenWithPreviewButton key={index} dokumen={file} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextDokumenMultiFile;
