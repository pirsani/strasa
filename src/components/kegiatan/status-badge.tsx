import {
  getStatusLangkah,
  mapStatusLangkahToDesc,
  StatusLangkah,
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
  status: StatusLangkah | string | null;
  className?: string;
}

const statusIcons = {
  Draft: <BookDashed size={16} className="mr-1" />,
  Submitted: <Forward size={16} className="mr-1" />,
  Revise: <PencilLine size={16} className="mr-1" />,
  Revised: <Pencil size={16} className="mr-1" />,
  Verified: <Check size={16} className="mr-1" />,
  Approved: <CheckCheck size={16} className="mr-1" />,
  Paid: <HandCoins size={16} className="mr-1" />,
  End: <Goal size={16} className="mr-1" />,
};

const StatusIcon = ({
  status: initStatus,
}: {
  status: StatusBadgeProps["status"];
}) => {
  const status = getStatusLangkah(initStatus);
  if (status === null) return null;
  return statusIcons[status];
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <div
      className={cn(
        "rounded-sm px-2 flex flex-row h-[24px] items-center",
        status == "Draft"
          ? "bg-yellow-300 text-yellow-800"
          : status == "Submitted"
          ? "bg-blue-300 text-blue-800"
          : status == "Revise"
          ? "bg-yellow-300 text-yellow-800"
          : status == "Revised"
          ? "bg-yellow-300 text-yellow-800"
          : status == "Verified"
          ? "bg-green-300 text-green-800"
          : status == "Approved"
          ? "text-green-300 bg-green-800"
          : status == "Paid"
          ? "bg-green-300 text-green-800"
          : "bg-gray-200 text-gray-500"
      )}
    >
      <StatusIcon status={status} />
      {mapStatusLangkahToDesc(status)}
    </div>
  );
};

export default StatusBadge;
