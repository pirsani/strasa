import {
  KolomPilihanAksi2,
  TabelGenericWithoutInlineEdit,
} from "@/components/tabel-generic-without-inline-edit";
import { ColumnDef } from "@tanstack/react-table";
import { format, formatDate } from "date-fns";
import { useEffect, useState } from "react";

interface ValidationResult {
  isValid: boolean;
  message?: string[];
}

export interface Itinerary {
  tanggalMulai: Date;
  tanggalSelesai: Date;
  dariLokasiId: string;
  dariLokasi?: string | null;
  keLokasiId: string;
  keLokasi?: string | null;
}

interface TabelItineraryProps {
  data: Itinerary[];
  onDelete?: (row: Itinerary) => void;
  onDataChange?: (isValid: boolean) => void;
}
const TabelItinerary = ({
  data,
  onDelete = () => {},
  onDataChange = () => {},
}: TabelItineraryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
  });

  const handleDelete = (row: Itinerary) => {
    console.log("Delete", row);
    // Delete the row from the data
    onDelete && onDelete(row);
  };

  const columns: ColumnDef<Itinerary>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
    },
    {
      accessorKey: "tanggalMulai",
      header: "Tanggal Mulai",
      cell: (info) => format(info.row.original.tanggalMulai, "yyyy-MM-dd"),
    },
    {
      accessorKey: "tanggalSelesai",
      header: "Tanggal Selesai",
      cell: (info) => format(info.row.original.tanggalSelesai, "yyyy-MM-dd"),
    },
    {
      accessorKey: "dariLokasi",
      header: "Dari",
      cell: (info) => info.row.original.dariLokasi,
    },
    {
      accessorKey: "keLokasi",
      header: "Ke",
      cell: (info) => info.row.original.keLokasi,
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: (info) =>
        KolomPilihanAksi2<Itinerary>(info, ["delete"], isEditing, {
          onDelete: handleDelete,
        }),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  useEffect(() => {
    const validationResult = validateItineraryChain(data);
    setValidation(validationResult);
    onDataChange(validationResult.isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <TabelGenericWithoutInlineEdit
        data={data}
        columns={columns}
        frozenColumnCount={1}
        isEditing={isEditing}
        editableRowId={editableRowId}
        hidePagination
      />
      <ValidationMessage validation={validation} />
    </>
  );
};

// Function to validate the itinerary chain

const ValidationMessage = ({
  validation,
}: {
  validation: ValidationResult;
}) => {
  if (validation.isValid) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {validation.message?.map((msg, i) => {
        return (
          <p key={i} className="py-1">
            {msg}
          </p>
        );
      })}
    </div>
  );
};

function validateItineraryChain(data: Itinerary[]): ValidationResult {
  if (data.length === 0)
    return {
      isValid: false,
      message: ["Invalid itinerary: No data provided"],
    }; // No data, it's valid by default

  // Sort by tanggalMulai to process itineraries in chronological order
  const sortedData = data.sort(
    (a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime()
  );

  // Iterate through the sorted data and check for gaps
  for (let i = 1; i < sortedData.length; i++) {
    const previous = sortedData[i - 1];
    const current = sortedData[i];

    //const nextDayAfterPrevious = new Date(previous.tanggalSelesai);
    // nextDayAfterPrevious.setDate(nextDayAfterPrevious.getDate() + 1); // Check if current tanggalMulai is the day after the previous tanggalSelesai
    const endDayPrevious = new Date(previous.tanggalSelesai);

    const prevSelesai = formatDate(previous.tanggalSelesai, "yyyy-MM-dd");
    const currentMulai = formatDate(current.tanggalMulai, "yyyy-MM-dd");

    const message = [];

    // If there's a gap, return false (invalid itinerary)
    if (current.tanggalMulai.getTime() !== endDayPrevious.getTime()) {
      message.push(
        `Invalid itinerary: [${previous.dariLokasi} to ${previous.keLokasi}] ${prevSelesai} next itinerary should start on ${prevSelesai} from ${previous.keLokasi} \n\n
        but found ${currentMulai} from ${current.dariLokasi}`
      );
    }

    //if location is not chained return false
    if (previous.keLokasiId !== current.dariLokasiId) {
      message.push(
        `Invalid itinerary: ${previous.keLokasi} is not connected to ${current.dariLokasi}, next itinerary should start from ${previous.keLokasi}`
      );
    }

    if (message.length > 0) {
      return {
        isValid: false,
        message,
      };
    }
  }

  // If no gaps were found, return true (valid itinerary)
  return {
    isValid: true,
  };
}

export default TabelItinerary;
