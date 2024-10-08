"use client";
import { useSearchParams } from "next/navigation";
import FormKegiatan from "./form-kegiatan";

const SetupKegiatanContainer = () => {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") || null;
  //const editId = null;
  return (
    <div>
      <FormKegiatan editId={editId} />
    </div>
  );
};

export default SetupKegiatanContainer;
