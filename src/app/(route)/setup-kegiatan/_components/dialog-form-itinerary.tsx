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
import { Plus, Ticket } from "lucide-react";

interface DialogFormItineraryProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}
export const DialogFormItinerary = ({
  open,
  setOpen,
  children,
}: DialogFormItineraryProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-36">
          <Plus size={12} />
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
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogFormItinerary;
