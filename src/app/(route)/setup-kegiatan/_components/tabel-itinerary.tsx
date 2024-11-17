import {
  KolomPilihanAksi2,
  TabelGenericWithoutInlineEdit,
} from "@/components/tabel-generic-without-inline-edit";
import { Itinerary } from "@/zod/schemas/itinerary";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format, formatDate } from "date-fns";
import { useEffect, useState } from "react";

export interface ValidationResult {
  isValid: boolean;
  message?: string[];
  itineraries?: Itinerary[];
}

interface TabelItineraryProps {
  data: Itinerary[];
  onDelete?: (row: Itinerary) => void;
  onEdit?: (row: Itinerary) => void;
  onDataChange?: (isValid: boolean) => void;
}
const TabelItinerary = ({
  data,
  onDelete = () => {},
  onEdit = () => {},
  onDataChange = () => {},
}: TabelItineraryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  //const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
  });

  const handleDelete = (row: Itinerary) => {
    console.log("Delete", row);
    // Delete the row from the data
    onDelete && onDelete(row);
  };

  const handleEdit = (row: Row<Itinerary>) => {
    console.log("Edit", row);
    // Set the row as editable
    //setIsEditing(true);
    //setEditableRowIndex(row.id);
    //console.log("editableRowId", editableRowId);
    //console.log("row", row.original);
    onEdit(row.original);
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
      accessorKey: "tanggalTiba",
      header: "Tanggal Tiba",
      cell: (info) => format(info.row.original.tanggalTiba, "yyyy-MM-dd"),
    },
    {
      accessorKey: "tanggalSelesai",
      header: "Tanggal Selesai",
      cell: (info) =>
        format(info.row.original.tanggalSelesai || "", "yyyy-MM-dd"),
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
        KolomPilihanAksi2<Itinerary>(info, ["delete", "edit"], isEditing, {
          onDelete: handleDelete,
          onEdit: handleEdit,
        }),
      meta: { isKolomAksi: true },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  useEffect(() => {
    console.log(data);
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
        //isEditing={isEditing}
        //editableRowId={editableRowId}
        hidePagination
      />
      <ValidationMessage validation={validation} />
    </>
  );
};

// Function to validate the itinerary chain

export const ValidationMessage = ({
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

// Helper function to get date without time
function getDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function setTanggalSelesai(sortedItineraries: Itinerary[]): Itinerary[] {
  // set tanggalSelesai for each itinerary
  return sortedItineraries.map((itinerary, index, arr) => {
    const nextItinerary = arr[index + 1]; // Get the next itinerary
    const tanggalSelesai = nextItinerary
      ? nextItinerary.tanggalMulai
      : itinerary.tanggalTiba;

    return {
      ...itinerary,
      tanggalSelesai, // Assign tanggalSelesai based on the logic
    };
  });
}

export function validateItineraryChain(data: Itinerary[]): ValidationResult {
  console.info("validateItineraryChain", data);
  if (data.length === 0)
    return {
      isValid: false,
      message: ["Warning: No data itinerary provided"],
    }; // No data, it's valid by default

  // Sort by tanggalMulai to process itineraries in chronological order
  const sortedData = data.sort(
    (a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime()
  );

  // set tanggalSelesai for each itinerary
  const sortedItinerariesWithTanggalSelesai = setTanggalSelesai(sortedData);

  // Iterate through the sorted data and check for gaps
  for (let i = 1; i < sortedItinerariesWithTanggalSelesai.length; i++) {
    const previous = sortedItinerariesWithTanggalSelesai[i - 1];
    const current = sortedItinerariesWithTanggalSelesai[i];

    //const nextDayAfterPrevious = new Date(previous.tanggalSelesai);
    // nextDayAfterPrevious.setDate(nextDayAfterPrevious.getDate() + 1); // Check if current tanggalMulai is the day after the previous tanggalSelesai
    const endDayPrevious = new Date(
      previous.tanggalSelesai || previous.tanggalTiba
    );

    const prevSelesai = formatDate(
      previous.tanggalSelesai || previous.tanggalTiba,
      "yyyy-MM-dd"
    );
    const currentMulai = formatDate(current.tanggalMulai, "yyyy-MM-dd");

    const message = [];

    console.log("previous", previous, "current", current);

    // Check if current itinerary starts on after the previous itinerary ends
    // get date only, ignore time
    if (
      getDateOnly(current.tanggalMulai).getTime() <
      getDateOnly(endDayPrevious).getTime()
    ) {
      console.warn(
        "INVALID Itinerary",
        getDateOnly(current.tanggalMulai).getTime(),
        getDateOnly(endDayPrevious).getTime()
      );
      message.push(
        `Invalid itinerary: next itinerary should start on ${prevSelesai} or later from ${previous.keLokasi} \n\n
    but found ${currentMulai} from ${current.dariLokasi}`
      );
    }

    //if location is not chained return false
    //         `Invalid itinerary: ${previous.keLokasi} is not connected to ${current.dariLokasi}, next itinerary should start from ${previous.keLokasi}`

    if (previous.keLokasiId !== current.dariLokasiId) {
      message.push(
        `Invalid itinerary: on ${format(
          current.tanggalMulai,
          "yyyy-MM-dd"
        )} next itinerary should start from ${previous.keLokasi}`
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
    itineraries: sortedItinerariesWithTanggalSelesai,
  };
}

export default TabelItinerary;
