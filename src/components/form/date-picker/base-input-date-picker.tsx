"use client";

import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Locale, format, getYear } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { SelectSingleEventHandler } from "react-day-picker";
import YmPicker from "./ym-date-picker";

export interface CalendarOptions {
  locale?: Locale;
  date?: Date;
  fromDate?: Date;
  toDate?: Date;
  dateFormat?: string;
}

interface DatePickerProps {
  calendarOptions?: CalendarOptions;
  date?: Date;
  type?: string;
  name: string;
  error?: string;
  className?: string;
  withYmPicker?: boolean;
  onSelect?: (date: Date) => void;
}

export type BaseInputDatePickerProps = DatePickerProps & CalendarProps;

export const defaultCalendarOptions: CalendarOptions = {
  locale: id,
  date: new Date(),
  fromDate: new Date(getYear(new Date()), 0, 1),
  toDate: new Date(getYear(new Date()), 11, 31),
  dateFormat: "yyyy-MM-dd", // 'dd-MM-yyyy' or 'yyyy-MM-dd'
};

const BaseInputDatePicker = ({
  calendarOptions = defaultCalendarOptions,
  name,
  error,
  type = "text",
  className,
  withYmPicker = true,
  onSelect,
  ...props
}: BaseInputDatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(calendarOptions.date);
  const [ymDate, setYmDate] = useState<Date | undefined>(date);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSelect: SelectSingleEventHandler = (newDate) => {
    if (!newDate) return;
    setDate(newDate);
    setIsPopoverOpen(false);

    // Format the selected date according to the dateFormat specified in calendarOptions
    const formattedDate = format(
      newDate,
      calendarOptions.dateFormat ?? "yyyy-MM-dd",
      {
        locale: calendarOptions.locale,
      }
    );

    // Invoke the onSelect callback if provided
    onSelect && onSelect(newDate);
  };

  return (
    <div className={cn("flex flex-col")}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <div className={cn("flex flex-col w-full ")}>
            <div className="relative group">
              <CalendarIcon className="absolute top-2 ml-2 text-gray-300" />
              <input
                placeholder="yyyy-mm-dd"
                readOnly
                required
                pattern="\d{4}-\d{2}-\d{2}"
                type={type}
                id={name}
                value={
                  date
                    ? format(
                        new Date(date),
                        calendarOptions?.dateFormat ?? "yyyy-MM-dd"
                      )
                    : ""
                }
                onClick={() => setIsPopoverOpen(true)}
                className={cn(
                  "form-control block w-full px-1 pl-10 py-2 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none peer",
                  className
                )}
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          {withYmPicker && (
            <YmPicker
              fromDate={calendarOptions.fromDate}
              toDate={calendarOptions.toDate}
              onSelect={setYmDate}
              date={date}
              locale={calendarOptions.locale}
            />
          )}
          <Calendar
            mode="single"
            locale={calendarOptions.locale}
            selected={date}
            onSelect={handleSelect}
            fromDate={calendarOptions.fromDate}
            toDate={calendarOptions.toDate}
            month={ymDate ?? date}
            onMonthChange={setYmDate}
          />
        </PopoverContent>
      </Popover>
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
};

export default BaseInputDatePicker;
