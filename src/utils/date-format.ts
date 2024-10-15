import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export const formatHariTanggal = (date?: string | Date | null): string => {
  console.log("date", date);
  if (!date) return "";
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, "PPPP", { locale: id });
  } catch (error) {
    return date.toString();
  }
};

export const formatTanggal = (
  date?: string | Date | null,
  formatStr: string = "d MMMM yyyy"
): string => {
  if (!date) return "";
  try {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: id });
  } catch (error) {
    return date.toString();
  }
};

// Example usage
//const date = new Date();
//console.log(formatDateToIndonesian(date)); // Output: "Senin, 9 Oktober 2023"
