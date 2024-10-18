"use client";
import { Itinerary } from "@/zod/schemas/itinerary";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import DialogFormItinerary from "./dialog-form-itinerary";
import FormItinerary from "./form-itinerary";
import TabelItinerary, {
  validateItineraryChain,
  ValidationMessage,
} from "./tabel-itinerary";

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
    // Check if the data is already in the list base on the id
    const isDataExist = data.find((r) => r.id === itinerary.id);

    // update the data if it's already exist
    const dataBefore = data;

    if (isDataExist) {
      // validate before add

      const dataAfter = data.map((r) => {
        if (r.id === itinerary.id) {
          return itinerary;
        }
        return r;
      });

      const iteneraryChain = validateItineraryChain(dataAfter);
      if (!iteneraryChain.isValid) {
        toast.error(<ValidationMessage validation={iteneraryChain} />, {
          duration: 5000,
          closeButton: true,
        });
        return false;
      }

      // set data if iteneraryChain.isValid
      setData((prev) =>
        prev.map((r) => {
          if (r.id === itinerary.id) {
            return itinerary;
          }
          return r;
        })
      );
      setEditableRow(null);
      return true;
    } else {
      const dataAfter = [...dataBefore, itinerary];
      const iteneraryChain = validateItineraryChain(dataAfter);
      if (!iteneraryChain.isValid) {
        toast.error(<ValidationMessage validation={iteneraryChain} />);
        return false;
      }
      // set data
      setData((prev) => [...prev, itinerary]);
    }

    toast.info(
      `Menyimpan data itinerary dari ${itinerary.dariLokasi} ke ${itinerary.keLokasi}`
    );
    return true;
  };
  const handleDelete = (row: Itinerary) => {
    console.log("tobe deleted", row);
    setData((prev) => prev.filter((r) => r.id !== row.id));
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
