import { isValid, parseISO } from "date-fns";
import { z } from "zod";

// Custom validation function to check if the input is a valid date string
export const isValidDateString = (value: string) => {
  const parsedDate = parseISO(value);
  return isValid(parsedDate);
};

// Transform function to convert a valid date string to a Date object
const transformToDate = (value: string) => new Date(value.substring(0, 10));

// Non-optional schema: the value must be a valid date string or a Date object
export const tanggalSchema = z.union([
  z
    .string()
    .refine(isValidDateString, {
      message: "Invalid, use format as yyyy-mm-dd.",
    })
    .transform(transformToDate),
  z.date(),
]);

// Optional schema: allows undefined or an empty string, but validates if provided
export const tanggalSchemaOptional = z.union([
  z
    .string()
    .refine((value) => value === "" || isValidDateString(value), {
      message: "Invalid, use format as yyyy-mm-dd.",
    })
    .transform((value) => (value ? transformToDate(value) : undefined))
    .optional(), // Allow optional strings or undefined
  z.date().optional(),
]);
