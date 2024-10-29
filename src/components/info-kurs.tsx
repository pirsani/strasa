import getKursBankIndonesia, { KursResponse } from "@/utils/kurs-bi";
import { useEffect, useState } from "react";

const InfoKurs = () => {
  const [kurs, setKurs] = useState<KursResponse | null>(null);
  useEffect(() => {
    const fetchKurs = async () => {
      const k = await getKursBankIndonesia(new Date());
      if (k) setKurs(k);
    };
    fetchKurs();
  }, []);

  return (
    <div>
      <h1>Info Kurs BI</h1>
      {kurs ? (
        <div>
          <p>
            Beli: {kurs.beli} | Jual: {kurs.jual} | Tanggal: {kurs.tanggal}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InfoKurs;
