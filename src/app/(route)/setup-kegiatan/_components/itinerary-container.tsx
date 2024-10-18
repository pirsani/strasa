"use client";
import { Itinerary } from "@/zod/schemas/itinerary";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import DialogFormItinerary from "./dialog-form-itinerary";
import FormItinerary from "./form-itinerary";
import TabelItinerary from "./tabel-itinerary";

interface ItineraryContainerProps {
  onItineraryChange?: (data: Itinerary[]) => void;
}
const ItineraryContainer = ({
  onItineraryChange = () => {},
}: ItineraryContainerProps) => {
  const {
    setValue,
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const [data, setData] = useState<Itinerary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editableRow, setEditableRow] = useState<Itinerary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const handleFormSubmit = (itinerary: Itinerary) => {
    toast.info(
      `Menyimpan data itinerary dari ${itinerary.dariLokasi} ke ${itinerary.keLokasi}`
    );

    // Check if the data is already in the list base on the id
    const isDataExist = data.find((r) => r.id === itinerary.id);

    // update the data if it's already exist
    if (isDataExist) {
      setData((prev) =>
        prev.map((r) => {
          if (r.id === itinerary.id) {
            return itinerary;
          }
          return r;
        })
      );
      return true;
    } else {
      setData((prev) => [...prev, itinerary]);
    }
    return true;
  };
  const handleDelete = (row: Itinerary) => {
    setData((prev) => prev.filter((r) => r !== row));
  };

  const handleOnDataChange = (isValid: boolean) => {
    setValue("isValidItinerary", isValid);
    console.log("isValidItinerary", isValid);
    if (isValid) {
      console.log("handleOnDataChange data", data);
      onItineraryChange(data);
    }
  };

  const handleOnEdit = (row: Itinerary) => {
    setEditableRow(row);
    setIsOpen(true);
  };

  return (
    <div className="w-full flex-grow flex flex-col">
      <DialogFormItinerary open={isOpen} setOpen={setIsOpen}>
        <FormItinerary
          onCancel={() => setIsOpen(false)}
          simpanDataItinerary={handleFormSubmit}
          itinerary={editableRow}
        />
      </DialogFormItinerary>
      <div className="flex-grow overflow-auto">
        <TabelItinerary
          data={data}
          onDelete={handleDelete}
          onEdit={handleOnEdit}
          onDataChange={handleOnDataChange}
        />
      </div>
    </div>
  );
};

export default ItineraryContainer;
