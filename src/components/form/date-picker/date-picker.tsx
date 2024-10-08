"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { SelectSingleEventHandler } from "react-day-picker";
import YmPicker from "./ym-date-picker";

interface IDatePickerProps {
  date?: Date;
  onSelect?: (date?: Date) => void;
  withYmPicker?: boolean;
}

export type DatePickerProps = IDatePickerProps & CalendarProps;

export const DatePicker = ({
  date: Initdate,
  onSelect,
  withYmPicker = true,
  ...props
}: DatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(Initdate);
  const [ymDate, setYmDate] = useState<Date | undefined>(date);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSelect: SelectSingleEventHandler = (newDate) => {
    //console.log("newDate", newDate);
    setDate(newDate ?? date);
    onSelect && onSelect(newDate ?? date);
    setIsPopoverOpen(false);
  };

  const defaultStartDate = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "PPP", { locale: props.locale ?? id })
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {withYmPicker && (
          <YmPicker
            fromDate={props.fromDate ?? defaultStartDate}
            toDate={props.toDate ?? defaultEndDate}
            onSelect={setYmDate}
            date={date}
            locale={props.locale ?? id}
          />
        )}
        <Calendar
          mode="single"
          locale={props.locale ?? id}
          selected={date}
          onSelect={handleSelect}
          fromDate={props.fromDate ?? defaultStartDate}
          toDate={props.toDate ?? defaultEndDate}
          month={ymDate ?? date}
          onMonthChange={setYmDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
