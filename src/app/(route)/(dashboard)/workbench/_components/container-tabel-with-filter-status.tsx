"use client";
import { KegiatanIncludeSatker } from "@/actions/kegiatan";
import { getKegiatanHasStatusPengajuan } from "@/actions/kegiatan/riwayat-kegiatan";
import { Button } from "@/components/ui/button";
import { StatusCount } from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FilterStatus from "./filter-status";
import TabelKegiatan from "./tabel-kegiatan";

interface ContainerTabelWithFilterStatusProps {
  kegiatan: KegiatanIncludeSatker[];
  status: StatusCount[] | null;
  timestamp?: number;
}
const ContainerTabelWithFilterStatus = ({
  kegiatan: initialKegiatan,
  status,
  timestamp = new Date().getTime(),
}: ContainerTabelWithFilterStatusProps) => {
  const [data, setData] = useState(initialKegiatan);
  const [filterStatus, setFilterStatus] = useState<STATUS_PENGAJUAN | null>(
    null
  );

  const handleOnStatusChange = async (status: STATUS_PENGAJUAN | null) => {
    setFilterStatus(status);
    setData([]);
    const kegiatan = await getKegiatanHasStatusPengajuan(status);
    setData(kegiatan);
  };

  useEffect(() => {
    setData(initialKegiatan);
  }, [initialKegiatan]);

  if (!status) {
    return <div>Not found</div>;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row w-full items-end justify-end px-2 gap-2">
        <FilterStatus
          status={status}
          onChange={handleOnStatusChange}
          filterSelected={filterStatus}
        />
        <Button variant={"outline"}>
          <Link
            href={`/download/excel-pembayaran/${timestamp}`}
            target="_blank"
            className="flex flex-row gap-2 items-center"
          >
            <FileSpreadsheet size={24} /> Download Excel
          </Link>
        </Button>
      </div>

      <TabelKegiatan data={data} />
    </div>
  );
};

export default ContainerTabelWithFilterStatus;
