"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FieldError, useFormContext } from "react-hook-form";
import YmPicker from "./ym-date-picker";

interface CalendarOptions {
  locale?: Locale;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
  dateFormat?: string;
}

interface DatePickerProps {
  calendarOptions?: CalendarOptions;
  name: string;
  error?: FieldError | undefined;
  className?: string;
  onSelect?: (date: Date) => void;
  tabIndex?: number;
}

const defaultCalendarOptions: CalendarOptions = {
  date: new Date(),
  dateFormat: "yyyy-MM-dd",
};

const FocusableDatePicker = ({
  calendarOptions = defaultCalendarOptions,
  name,
  error,
  className,
  onSelect,
  tabIndex = 0,
}: DatePickerProps) => {
  const { setValue } = useFormContext();
  const [date, setDate] = useState<Date | undefined>(calendarOptions.date);
  const [ymDate, setYmDate] = useState<Date | undefined>(date);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const preventReopen = useRef(false); // Ref to control reopening behavior

  // Automatically close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handles date selection from the calendar
  const handleSelectDate = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If selected date is different, update state and close popover
      if (!date || selectedDate.getTime() !== date.getTime()) {
        setDate(selectedDate);
        const formattedDate = format(
          selectedDate,
          calendarOptions.dateFormat || "yyyy-MM-dd"
        );
        setValue(name, formattedDate, { shouldValidate: true });
        if (onSelect) onSelect(selectedDate);
      }
      setIsPopoverOpen(false);
      preventReopen.current = true; // Prevent immediate focus reopen
      inputRef.current?.focus(); // Focus back on the input
      setTimeout(() => {
        preventReopen.current = false; // Re-enable focus handling after a short delay
      }, 100); // Adjust the delay if needed to handle focus state correctly
    } else {
      setIsPopoverOpen(false); // Close popover without setting prevent flag
    }
  };

  // Prevent popover from reopening immediately on focus after date selection
  const handleFocus = () => {
    if (!preventReopen.current) {
      setIsPopoverOpen(true);
    }
  };

  // Toggle popover explicitly when button is clicked
  const handlePopoverToggle = () => {
    if (!isPopoverOpen) {
      preventReopen.current = false; // Ensure the flag is reset before opening
    }
    setIsPopoverOpen(!isPopoverOpen);
  };

  return (
    <div className={cn("flex flex-col mb-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            onClick={handlePopoverToggle}
            onFocus={handleFocus}
            tabIndex={tabIndex}
            className="flex items-center justify-between w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="Open date picker"
            aria-expanded={isPopoverOpen}
            aria-controls="calendar-popover"
          >
            <CalendarIcon className="mr-2 text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={
                date
                  ? format(date, calendarOptions.dateFormat || "yyyy-MM-dd")
                  : ""
              }
              placeholder="Select a date"
              className="w-full bg-transparent border-none focus:outline-none"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          id="calendar-popover"
          role="dialog"
          aria-modal="true"
        >
          <YmPicker
            fromDate={calendarOptions.fromDate}
            toDate={calendarOptions.toDate}
            onSelect={setYmDate}
            date={date}
            locale={calendarOptions.locale}
          />
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            fromDate={calendarOptions.fromDate}
            toDate={calendarOptions.toDate}
            locale={calendarOptions.locale}
            month={ymDate ?? date}
          />
        </PopoverContent>
      </Popover>
      {error && <span className="text-red-500">{error.message}</span>}
    </div>
  );
};

export default FocusableDatePicker;
