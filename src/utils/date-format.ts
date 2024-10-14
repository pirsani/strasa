import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export const formatHariTanggal = (date: string | Date): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "PPPP", { locale: id });
};

export const formatTanggal = (date: string | Date): string => {
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return format(parsedDate, "d MMMM yyyy", { locale: id });
};

// Example usage
//const date = new Date();
//console.log(formatDateToIndonesian(date)); // Output: "Senin, 9 Oktober 2023"
