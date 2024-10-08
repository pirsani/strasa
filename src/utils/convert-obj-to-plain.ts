import Decimal from "decimal.js";

/**
 * Converts an object's properties of type `Decimal` to numbers and `Date` objects to ISO strings.
 * The function preserves the optional generic type `T`.
 *
 * @template T - The optional generic type to which the result should conform.
 * @param {any} obj - The object to be converted.
 * @returns {T} - The converted object conforming to the specified type `T`.
 *
 * @example
 * import { Decimal } from "decimal.js";
 *
 * type ExampleType = {
 *   id: number;
 *   besaran: number;
 *   createdAt: string;
 *   updatedAt: string;
 *   nested: {
 *     value: number;
 *     date: string;
 *   };
 * };
 *
 * const exampleObject = {
 *   id: 1,
 *   besaran: new Decimal(100),
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 *   nested: {
 *     value: new Decimal(200),
 *     date: new Date(),
 *   },
 * };
 *
 * const convertedObject = convertSpecialTypesToPlain<ExampleType>(exampleObject);
 * console.log(convertedObject);
 */
export function convertSpecialTypesToPlain<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertSpecialTypesToPlain(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Decimal.isDecimal(obj[key])) {
        newObj[key] = new Decimal(obj[key]).toNumber(); // Convert to Decimal and then to number
      } else if (obj[key] instanceof Date) {
        newObj[key] = obj[key].toISOString(); // Convert Date to ISO string
      } else {
        newObj[key] = convertSpecialTypesToPlain(obj[key]); // Recursive call for nested objects
      }
    }
    return newObj as T;
  }

  return obj as T;
}
