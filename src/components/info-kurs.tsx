import getKursBankIndonesia, { KursResponse } from "@/utils/kurs-bi";
import { useEffect, useState } from "react";

const InfoKurs = () => {
  const [kurs, setKurs] = useState<KursResponse | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    const fetchKurs = async () => {
      setIsFetching(true);
      const k = await getKursBankIndonesia(new Date());
      if (k) {
        k.tengah = (k.beli + k.jual) / 2;
        setKurs(k);
      }
      setIsFetching(false);
    };
    fetchKurs();
  }, []);

  if (isFetching) {
    return <p>Loading...</p>;
  }

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
        <p className="bg-red-200 text-red-500 p-2">
          Kurs tanggal {new Date().toISOString().split("T")[0]} tidak tersedia
        </p>
      )}
    </div>
  );
};

export default InfoKurs;
