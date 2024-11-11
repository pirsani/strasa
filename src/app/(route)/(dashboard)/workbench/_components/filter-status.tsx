import { Button } from "@/components/ui/button";
import { StatusCount } from "@/data/kegiatan/riwayat-pengajuan";
import {
  mapStatusLangkahToColor,
  mapStatusLangkahToDesc,
  STATUS_PENGAJUAN,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FilterStatusProps {
  status: StatusCount[];
  onChange: (status: STATUS_PENGAJUAN | null) => void;
  filterSelected?: STATUS_PENGAJUAN | null;
}

const FilterStatus = ({
  status,
  onChange,
  filterSelected,
}: FilterStatusProps) => {
  return (
    <div>
      <div className="flex flex-row gap-2">
        {status.map((item) => (
          <Button
            key={item.status}
            className={cn(
              mapStatusLangkahToColor(item.status),
              filterSelected === item.status &&
                "ring-2 ring-black shadow-2xl shadow-lg shadow-gray-500/50 "
            )}
            onClick={() => onChange(item.status)}
            type="button"
          >
            [{item.count.toString()}] {mapStatusLangkahToDesc(item.status)}
          </Button>
        ))}
        <Button
          className={cn(
            "bg-gray-500",
            filterSelected === null && "ring-2 ring-black"
          )}
          onClick={() => onChange(null)}
          type="button"
        >
          Semua
        </Button>
      </div>
    </div>
  );
};

export default FilterStatus;
