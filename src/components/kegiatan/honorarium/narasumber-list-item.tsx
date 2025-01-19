"use client";
import { deleteNarasumberJadwal } from "@/actions/honorarium/narasumber/narasumber";
import { OptionSbm } from "@/actions/sbm";
import ConfirmDialog from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { JadwalNarsum } from "@/data/jadwal";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ALUR_PROSES } from "@prisma-honorarium/client";
import { ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import NarasumberDetail from "./narusumber-detail";

interface NarasumberListItemProps {
  jadwalNarasumber: JadwalNarsum;
  optionsSbmHonorarium: OptionSbm[];
  index: number;
  totalNarsum?: number;
  proses?: ALUR_PROSES | null;
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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const toggleDetail = () => {
    setIsDetailOpen((prevState) => !prevState);
  };

  const handleDeleteNarasumber = () => {
    setIsConfirmDialogOpen(true);
  };
  const handleConfirmDeleteNarasumber = async () => {
    const hapus = await deleteNarasumberJadwal(
      jadwalNarasumber.narasumberId,
      jadwalNarasumber.jadwalId
    );
    if (!hapus.success) {
      toast.error(hapus.message);
      return;
    }
    setIsDeleted(true);
  };
  const handleCancel = () => {
    setIsConfirmDialogOpen(false);
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          "flex flex-row w-full py-1 justify-center  gap-2",
          index !== totalNarsum - 1 && "border-gray-300 border-b",
          isDetailOpen ? "items-start" : "items-center"
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
          <ConfirmDialog
            message={`Hapus narasumber${jadwalNarasumber.narasumber.nama} ?`}
            isOpen={isConfirmDialogOpen}
            onConfirm={handleConfirmDeleteNarasumber}
            onCancel={handleCancel}
          />
        </Column>

        {!isDetailOpen && (
          <div className="flex flex-row w-full">
            <Column className="group-hover:line-through">
              {jadwalNarasumber.narasumber.nama}
            </Column>
            <Column className="group-hover:line-through">
              {jadwalNarasumber.narasumber.jabatan}
            </Column>
            {proses === "PENGAJUAN" && (
              <Column className="ml-auto">
                <div className="group">
                  <Button
                    className="hover:bg-destructive hover:text-gray-50"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteNarasumber}
                  >
                    <Trash2 size={12} />
                    <span>Hapus Narasumber</span>
                  </Button>
                </div>
              </Column>
            )}
          </div>
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
