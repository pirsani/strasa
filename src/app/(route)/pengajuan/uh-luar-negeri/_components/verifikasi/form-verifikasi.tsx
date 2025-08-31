"use client";
import { PesertaKegiatanDalamNegeri } from "@/actions/kegiatan/peserta/dalam-negeri";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FormVerifikasiUhDalamNegeriProps {
  kegiatanId: string;
  pesertaUpdated?: PesertaKegiatanDalamNegeri[] | null;
  onSetuju?: () => void;
  onRevisi?: (catatanRevisi: string) => void;
}
const FormVerifikasiUhDalamNegeri = ({
  kegiatanId,
  onSetuju,
  onRevisi,
}: FormVerifikasiUhDalamNegeriProps) => {
  const [catatanRevisi, setCatatanRevisi] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const handleSetuju = () => {
    if (!onSetuju) return;
    onSetuju();
    setIsDone(true);
  };

  const handleRevisi = () => {
    if (!onRevisi) return;
    onRevisi(catatanRevisi || "");
    setIsDone(true);
  };

  if (isDone) return null;

  return (
    <div className="flex flex-col w-full gap-2">
      <div>
        <h3 className="text-lg font-bold">Keterangan Revisi</h3>
        <textarea
          className="w-full h-24 border border-gray-300 rounded p-2 ring-blue-500 outline-red-500"
          placeholder="Tulis catatan disini"
          onChange={(e) => setCatatanRevisi(e.target.value)}
        ></textarea>
      </div>
      <div className="flex flex-row gap-2 justify-end">
        <Button
          type="button"
          className="w-1/3"
          variant={"destructive"}
          onClick={handleRevisi}
        >
          Revisi
        </Button>
        <Button type="button" className="w-1/3" onClick={handleSetuju}>
          Setuju
        </Button>
      </div>
    </div>
  );
};

export default FormVerifikasiUhDalamNegeri;
