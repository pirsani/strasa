import getKursBankIndonesia, { KursResponse } from "@/utils/kurs-bi";
import { useEffect, useState } from "react";

const InfoKurs = () => {
  const [kurs, setKurs] = useState<KursResponse | null>(null);
  useEffect(() => {
    const fetchKurs = async () => {
      const k = await getKursBankIndonesia(new Date());
      if (k) {
        k.tengah = (k.beli + k.jual) / 2;
        setKurs(k);
      }
    };
    fetchKurs();
  }, []);

  return (
    <div>
      {kurs ? (
        <>
          <h1>Info Kurs BI, Tanggal: {kurs.tanggal} </h1>

          <div>
            <p>
              Beli: {kurs.beli} | Jual: {kurs.jual} | Tengah: {kurs.tengah}
            </p>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default InfoKurs;
