"use server";
import { parseStringPromise } from "xml2js";

export interface KursResponse {
  beli: number;
  jual: number;
  tengah?: number;
  tanggal: string;
}

const getKursBankIndonesia = async (
  tanggal: Date
): Promise<KursResponse | null> => {
  const isoDate = tanggal.toISOString().split("T")[0];
  const url = `https://www.bi.go.id/biwebservice/wskursbi.asmx/getSubKursLokal3?mts=USD&startdate=${isoDate}&enddate=${isoDate}`;

  try {
    // Fetch the XML data
    const response = await fetch(url);
    const xml = await response.text();

    // Parse the XML to JSON
    const result = await parseStringPromise(xml);

    // Check if the required elements exist
    const diffgram = result["DataSet"]["diffgr:diffgram"];
    if (
      !diffgram ||
      !diffgram[0] ||
      !diffgram[0]["NewDataSet"] ||
      !diffgram[0]["NewDataSet"][0]["Table"]
    ) {
      console.log("No kurs data found for: ", isoDate);
      // repeat the request with the previous date
      const previousDate = new Date(tanggal);
      previousDate.setDate(tanggal.getDate() - 1);
      return getKursBankIndonesia(previousDate);
      //return null;
    }

    console.log("Kurs data found for: ", isoDate);

    // Navigate to extract required fields
    const table = diffgram[0]["NewDataSet"][0]["Table"][0];
    const beliSubkurslokal = parseFloat(table["beli_subkurslokal"][0]);
    const jualSubkurslokal = parseFloat(table["jual_subkurslokal"][0]);
    const tglSubkurslokal = table["tgl_subkurslokal"][0];

    return {
      beli: beliSubkurslokal,
      jual: jualSubkurslokal,
      tengah: (beliSubkurslokal + jualSubkurslokal) / 2,
      tanggal: tglSubkurslokal.split("T")[0],
    };
  } catch (error) {
    console.error("Error fetching or parsing XML:", error);
    return null;
  }
};

export default getKursBankIndonesia;
