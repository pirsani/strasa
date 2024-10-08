"use client";
import { OptionSbm } from "@/actions/sbm";
import { Button } from "@/components/ui/button";
import { JadwalNarsum, Narsum } from "@/data/jadwal";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import NarasumberDetail from "./narusumber-detail";

interface NarasumberListItemProps {
  jadwal: JadwalNarsum;
  optionsSbmHonorarium: OptionSbm[];
  index: number;
  totalNarsum?: number;
}
export const NarasumberListItem = ({
  jadwal,
  index = 0,
  totalNarsum = 1,
  optionsSbmHonorarium = [],
}: NarasumberListItemProps) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Narsum | null>(null);
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
            <Column>{jadwal.narasumber.nama}</Column>
            <Column>{jadwal.narasumber.jabatan}</Column>
          </>
        )}
        {isDetailOpen && (
          <div className="p-0 bg-blue-50 h-auto w-full bg-white rounded-sm border border-blue-300">
            <NarasumberDetail
              optionsSbmHonorarium={optionsSbmHonorarium}
              narasumber={jadwal.narasumber}
              jadwalNarasumber={jadwal}
            />
          </div>
        )}
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
