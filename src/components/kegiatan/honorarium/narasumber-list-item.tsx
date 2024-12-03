"use client";
import { OptionSbm } from "@/actions/sbm";
import { Button } from "@/components/ui/button";
import { JadwalNarsum } from "@/data/jadwal";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ALUR_PROSES } from "@prisma-honorarium/client";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import NarasumberDetail from "./narusumber-detail";

interface NarasumberListItemProps {
  jadwalNarasumber: JadwalNarsum;
  optionsSbmHonorarium: OptionSbm[];
  index: number;
  totalNarsum?: number;
  proses?: ALUR_PROSES;
  statusPengajuanHonorarium?: STATUS_PENGAJUAN | null;
}
export const NarasumberListItem = ({
  jadwalNarasumber,
  index = 0,
  totalNarsum = 1,
  optionsSbmHonorarium = [],
  proses,
  statusPengajuanHonorarium = null,
}: NarasumberListItemProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const toggleDetail = () => {
    setIsDetailOpen((prevState) => !prevState);
  };
  return (
    <div>
      <div
        className={cn(
          "flex flex-row w-full py-1 items-start",
          index !== totalNarsum - 1 && "border-gray-300 border-b"
        )}
      >
        <Column>
          <Button
            variant={"ghost"}
            className={cn(
              "rounded-full w-9 h-9 p-0 ",
              isDetailOpen ? "bg-blue-100 border border-gray-300" : "bg-white"
            )}
            onClick={toggleDetail}
          >
            <ChevronRight
              size={12}
              transform={isDetailOpen ? "rotate(90)" : "rotate(0)"}
            />
          </Button>
        </Column>

        {!isDetailOpen && (
          <>
            <Column>{jadwalNarasumber.narasumber.nama}</Column>
            <Column>{jadwalNarasumber.narasumber.jabatan}</Column>
          </>
        )}
        <div
          className={cn(
            "p-0 bg-blue-50 h-auto w-full bg-white rounded-sm border border-blue-300",
            isDetailOpen ? "" : "hidden"
          )}
        >
          <NarasumberDetail
            optionsSbmHonorarium={optionsSbmHonorarium}
            narasumber={jadwalNarasumber.narasumber}
            jadwalNarasumber={jadwalNarasumber}
            proses={proses}
            statusPengajuanHonorarium={statusPengajuanHonorarium}
          />
        </div>
      </div>
    </div>
  );
};

const Column = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex px-1 items-center justify-center ", className)}>
      {children}
    </div>
  );
};

export default NarasumberListItem;
