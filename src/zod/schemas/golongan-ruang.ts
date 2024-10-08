import { z } from "zod";

// karena golongan ruang ada data refenrensi, maka kita harus memastikan bahwa data yang diinputkan sesuai dengan data referensi, karakter "-" juga dianggap valid dan di transform menjadi null untuk memudahkan user mengingat bahwa data tersebut tidak ada
const emptyStringToNull = z
  .string()
  .transform((val) => (val === "" || val === "-" ? null : val.toUpperCase()));

// Define the Zod enum with the desired values
const golonganRuangEnum = z.enum([
  //"-",
  "I/A",
  "I/B",
  "I/C",
  "I/D",
  "II/A",
  "II/B",
  "II/C",
  "II/D",
  "III/A",
  "III/B",
  "III/C",
  "III/D",
  "IV/A",
  "IV/B",
  "IV/C",
  "IV/D",
  "IV/E",
]);

// Generate the validation message with all available options
const availableOptions = golonganRuangEnum.options.join(", ");
const validationMessage = `Invalid Golongan/Ruang. Available options are: ${availableOptions}`;
// Create a custom validation function to handle case insensitivity
const golonganRuangSchema = z
  .string()
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => {
      return golonganRuangEnum.options.includes(value as any);
    },
    {
      message: validationMessage,
    }
  );

const pangkatGolonganOptionalNullableSchema = z
  .union([emptyStringToNull, golonganRuangSchema])
  .nullable()
  .optional()
  .refine(
    (val) =>
      val === null ||
      val === undefined ||
      golonganRuangSchema.safeParse(val).success,
    {
      message: validationMessage,
    }
  );

export {
  golonganRuangEnum,
  golonganRuangSchema,
  pangkatGolonganOptionalNullableSchema,
};
