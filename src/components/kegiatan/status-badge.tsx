import { mapStatusLangkahToDesc } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null;
  className?: string;
}
const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <div
      className={cn(
        "rounded-sm px-2 ",
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
          : "bg-transparent text-gray-500"
      )}
    >
      {mapStatusLangkahToDesc(status)}
    </div>
  );
};

export default StatusBadge;
