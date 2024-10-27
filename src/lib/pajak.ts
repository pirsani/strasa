import Decimal from "decimal.js";

/**
 * Mendapatkan besaran pajak honorarium berdasarkan golongan ruang dan Npwp.
 *
 * Jika golongan ruang III maka pajak 5% dan jika golongan ruang IV maka pajak 15%.
 * Jika tidak ada Npwp maka pajak lebih tinggi 20% dari pajak yang seharusnya.
 *
 * dpp untuk non ASN adalah 50% dari bruto
 * besaran pajak untuk non ASN 5% dari dpp
 *
 * @param {string} [golonganRuang] golongan ruang yang berupa string berisi
 *   golongan dan ruang yang dipisahkan oleh delimiter /
 * @param {string | null} [npwp] Npwp yang berupa string atau null/undefined
 * @returns {object} objek berisi besaran pajak dan besaran pajak tanpa npwp
 */
export const getBesaranPajakHonorarium = (
  golonganRuang?: string | null,
  npwp?: string | null
) => {
  // jika ada gologanRuang, split gologanRuang dengan delimiter /
  const golongan = golonganRuang?.split("/")[0];
  let besaranPajakMemilikiNpwp: Decimal = new Decimal(0);
  let besaranTanpaNpwp: Decimal | null = null;
  let besaranPajak: Decimal = new Decimal(0);

  switch (golongan) {
    case "I":
    case "II":
      besaranPajakMemilikiNpwp = new Decimal(0);
    case "III":
      besaranPajakMemilikiNpwp = new Decimal(0.05);
      break;
    case "IV":
      besaranPajakMemilikiNpwp = new Decimal(0.15);
      break;
    default:
      besaranPajakMemilikiNpwp = new Decimal(0.05);
      break;
  }

  if (!npwp || npwp === "" || npwp === "-") {
    besaranTanpaNpwp = besaranPajakMemilikiNpwp.times(new Decimal(1.2));
    besaranPajak = besaranTanpaNpwp;
  } else {
    besaranPajak = besaranPajakMemilikiNpwp;
  }

  return { besaranPajakMemilikiNpwp, besaranTanpaNpwp, besaranPajak };

  // jika tidak ada npwp maka 20 persen
};

//dpp = dasar pengenaan pajak
export const getDpp = (
  bruto: number | Decimal,
  golonganRuang?: string | null
) => {
  // jika tikdak punya golongan ruang maka bukan ASN dpp = 50%
  // jika ada golongan ruang maka dpp = 100%
  const brutoDecimal = new Decimal(bruto);
  if (!golonganRuang || golonganRuang === "" || golonganRuang === "-") {
    return brutoDecimal.times(new Decimal(0.5));
  } else {
    return brutoDecimal;
  }
};
