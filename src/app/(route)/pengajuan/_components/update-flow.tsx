"use client";
import { Button } from "@/components/ui/button";
import { Kegiatan, updateAlurLangkah } from "@/lib/alur-proses";
import { useState } from "react";

// const kegiatan: Kegiatan = {
//   id: 1,
//   langkahSekarang: "setup",
//   langkahSelanjutnya: "pengajuan",
//   status: "Draft",
// };

const UpdateFlow = ({ initKegiatan }: { initKegiatan: Kegiatan }) => {
  const [kegiatan, setKegiatan] = useState<Kegiatan>(initKegiatan);

  const handleSubmit = async () => {
    console.log("Update Flow");
    const response = await updateAlurLangkah(kegiatan, "Proceed");
    setKegiatan(response);
    console.log(response);
  };
  const handleRevisi = async () => {
    console.log("Update Flow");
    const response = await updateAlurLangkah(kegiatan, "Revise");
    setKegiatan(response);
    console.log(response);
  };
  return (
    <div>
      <h1>Update Flow</h1>
      <Button onClick={handleRevisi}>Revisi</Button>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default UpdateFlow;
