import { format } from "date-fns";
import { id } from "date-fns/locale";

export const formatHariTanggal = (date: Date): string => {
  return format(date, "PPPP", { locale: id });
};

export const formatTanggal = (date: Date): string => {
  return format(date, "d MMMM yyyy", { locale: id });
};

// Example usage
//const date = new Date();
//console.log(formatDateToIndonesian(date)); // Output: "Senin, 9 Oktober 2023"
