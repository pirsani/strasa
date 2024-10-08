"use client";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Itinerary } from "@/zod/schemas/itinerary";
import { Plus, Ticket } from "lucide-react";
import { useState } from "react";
import FormItinerary from "./form-itinerary";

interface DialogFormItineraryProps {
  onCancel?: () => void;
  handleFormSubmit?: (data: Itinerary) => boolean;
}
export const DialogFormItinerary = ({
  onCancel: handleCancel,
  handleFormSubmit = () => false,
}: DialogFormItineraryProps) => {
  const [open, setOpen] = useState(false);

  const onCancel = () => {
    handleCancel && handleCancel();
    setOpen(false);
  };

  // Closes the dialog if the form submission is successful
  const simpanDataItinerary = (data: Itinerary) => {
    setOpen(handleFormSubmit(data));
    // add to table
    // if (isSuccess) {
    //   setOpen(false);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-36">
          <Plus size={18} />
          <Ticket size={18} />
          <span className="hidden sm:block">Itinerary</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Itinerary</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Itinerary baru
          </DialogDescription>
        </DialogHeader>
        <FormItinerary
          onCancel={onCancel}
          simpanDataItinerary={simpanDataItinerary}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogFormItinerary;
