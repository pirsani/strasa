// Arabic to Roman numeral converter for numbers 1 to 12
const arabicToRoman = (num: number): string => {
  const romanNumerals: { [key: number]: string } = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
  };

  if (num < 1 || num > 12) {
    throw new Error("Month must be between 1 and 12"); // Handle out-of-bound input
  }

  return romanNumerals[num];
};
export const generateNomorSpd = (
  nomorSatker?: string | null,
  nomorTerakhir?: string | null
) => {
  let nomorPart = "001";
  if (nomorTerakhir) {
    const lastNumber = parseInt(nomorTerakhir.split("/")[0]) + 1;
    nomorPart = lastNumber.toString().padStart(3, "0");
  }
  const dt = new Date();
  const year = dt.getFullYear();
  const month = dt.getMonth() + 1;
  const day = dt.getDate();
  const monthRoman = arabicToRoman(month);

  const newNomor = `${nomorPart}/DL-SPD/${monthRoman}/${year}/${nomorSatker}`;
  return newNomor;
};
