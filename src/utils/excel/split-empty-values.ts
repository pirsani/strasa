/**
 * Splits the empty values into two objects based on whether the empty columns are part of `emptyAllowed`.
 *
 * @param emptyValues - A record where the keys are row indices and values are arrays of empty column names.
 * @param emptyAllowed - An array of allowed empty column names.
 * @returns An object containing two records:
 * - `allowEmpty`: Rows with empty columns that are part of `emptyAllowed`.
 * - `shouldNotEmpty`: Rows with empty columns that are not part of `emptyAllowed`.
 */
export const splitEmptyValues = (
  emptyValues: Record<number, string[]>,
  emptyAllowed: string[]
): {
  allowEmpty: Record<number, string[]>;
  shouldNotEmpty: Record<number, string[]>;
} => {
  const allowEmpty: Record<number, string[]> = {};
  const shouldNotEmpty: Record<number, string[]> = {};

  for (const [rowIndex, columns] of Object.entries(emptyValues)) {
    const rowNum = Number(rowIndex); // Convert rowIndex to number
    const [withAllowed, withoutAllowed] = columns.reduce(
      ([withAllowed, withoutAllowed], col) => {
        if (emptyAllowed.includes(col)) {
          withAllowed.push(col);
        } else {
          withoutAllowed.push(col);
        }
        return [withAllowed, withoutAllowed];
      },
      [[], []] as [string[], string[]]
    );

    if (withAllowed.length > 0) {
      allowEmpty[rowNum] = withAllowed;
    }

    if (withoutAllowed.length > 0) {
      shouldNotEmpty[rowNum] = withoutAllowed;
    }
  }

  return {
    allowEmpty,
    shouldNotEmpty,
  };
};

// // Example usage
// const emptyValues: Record<number, string[]> = {
//   1: ["Eselon", "OtherColumn"],
//   2: ["Lainny", "SomeColumn"],
//   3: ["AnotherColumn", "YetAnotherColumn"]
// };

// const emptyAllowed = ["Eselon", "Lainny"];

// const result = splitEmptyValues(emptyValues, emptyAllowed);

// console.log("Empty values with emptyAllowed:", result.allowEmpty);
// console.log("Empty values without emptyAllowed:", result.shouldNotEmpty);
