import {
  STATUS_PENGAJUAN,
  getStatusPengajuan,
  mapStatusLangkahToColor,
  mapStatusLangkahToDesc,
} from "@/lib/constants";

import { cn } from "@/lib/utils";
import {
  BookDashed,
  Check,
  CheckCheck,
  Forward,
  Goal,
  HandCoins,
  Pencil,
  PencilLine,
} from "lucide-react";

interface StatusBadgeProps {
  status: STATUS_PENGAJUAN | null;
  className?: string;
}

const statusIcons = {
  DRAFT: <BookDashed size={16} className="mr-1" />,
  SUBMITTED: <Forward size={16} className="mr-1" />,
  REVISE: <PencilLine size={16} className="mr-1" />,
  REVISED: <Pencil size={16} className="mr-1" />,
  VERIFIED: <Check size={16} className="mr-1" />,
  APPROVED: <CheckCheck size={16} className="mr-1" />,
  REQUEST_TO_PAY: <HandCoins size={16} className="mr-1" />,
  PAID: <HandCoins size={16} className="mr-1" />,
  END: <Goal size={16} className="mr-1" />,
  DONE: <Goal size={16} className="mr-1" />,
};

const StatusIcon = ({
  status: initStatus,
}: {
  status: StatusBadgeProps["status"];
}) => {
  const status = getStatusPengajuan(initStatus);
  if (status === null) return null;
  return statusIcons[status];
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <div
      className={cn(
        "rounded-sm px-2 flex flex-row h-[24px] items-center",
        mapStatusLangkahToColor(status)
        // status == "DRAFT"
        //   ? "bg-yellow-300 text-yellow-800"
        //   : status == "SUBMITTED"
        //   ? "bg-blue-300 text-blue-800"
        //   : status == "REVISE"
        //   ? "bg-yellow-300 text-yellow-800"
        //   : status == "REVISED"
        //   ? "bg-green-200 text-green-800"
        //   : status == "VERIFIED"
        //   ? "bg-green-200 text-green-800"
        //   : status == "APPROVED"
        //   ? "bg-green-400 text-green-800"
        //   : status == "REQUEST_TO_PAY"
        //   ? "bg-green-600 text-green-100"
        //   : status == "PAID"
        //   ? "bg-green-800 text-green-100"
        //   : status == "END"
        //   ? "bg-blue-700 text-white"
        //   : "bg-gray-200 text-gray-500"
      )}
    >
      <StatusIcon status={status} />
      {mapStatusLangkahToDesc(status)}
    </div>
  );
};

export default StatusBadge;
