"use client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import DialogFormItinerary from "./dialog-form-itinerary";
import TabelItinerary, { Itinerary } from "./tabel-itinerary";

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
  const handleFormSubmit = (data: Itinerary) => {
    toast.info(
      `Menyimpan data itinerary dari ${data.dariLokasi} ke ${data.keLokasi}`
    );
    setData((prev) => [...prev, data]);
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

  return (
    <div className="w-full flex-grow flex flex-col">
      <DialogFormItinerary handleFormSubmit={handleFormSubmit} />
      <div className="flex-grow overflow-auto">
        <TabelItinerary
          data={data}
          onDelete={handleDelete}
          onDataChange={handleOnDataChange}
        />
      </div>
    </div>
  );
};

export default ItineraryContainer;
