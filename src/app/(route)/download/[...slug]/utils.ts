import Decimal from "decimal.js";

// Function to sum pageSumsArray and map to summableFields
export const sumPageSumsArray = (
  pageSumsArray: Decimal[][],
  summableFields: (string | undefined)[]
) => {
  // Initialize an array to hold the sums, with the same length as summableFields
  const sums = new Array(summableFields.length).fill(new Decimal(0));

  // Sum the values in pageSumsArray
  pageSumsArray.forEach((subArray) => {
    subArray.forEach((value, index) => {
      sums[index] = sums[index].plus(value);
    });
  });

  // Map the sums to the corresponding fields in summableFields
  const result: { [key: string]: number } = {};
  for (let i = 0; i < summableFields.length; i++) {
    const field = summableFields[i];
    if (field === undefined) {
      return {}; // Return empty object if any field is undefined
    }
    result[field] = sums[i];
  }

  return result;
};
