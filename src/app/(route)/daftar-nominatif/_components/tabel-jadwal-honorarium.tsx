import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { Button } from "@/components/ui/button";
import {
  getObPlainJadwalByKegiatanIdWithStatusDisetujui,
  ObjPlainJadwalKelasNarasumber,
} from "@/data/jadwal";
import { useSearchTerm } from "@/hooks/use-search-term";
import { ColumnDef, Row } from "@tanstack/react-table";
import { WandSparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface TabelJadwalHonorariumProps {
  kegiatanId?: string | null;
}
const TabelJadwalHonorarium = ({ kegiatanId }: TabelJadwalHonorariumProps) => {
  const [dataJadwal, setDataJadwal] = useState<ObjPlainJadwalKelasNarasumber[]>(
    []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editableRowId, setEditableRowIndex] = useState<string | null>(null);
  const [originalData, setOriginalData] =
    useState<ObjPlainJadwalKelasNarasumber | null>(null);

  const { searchTerm } = useSearchTerm();
  const sortedDataJadwal = dataJadwal.sort((obj1, obj2) => {
    const date1 = new Date(obj1.tanggal);
    const date2 = new Date(obj2.tanggal);
    return date1.getTime() - date2.getTime();
  });
  const filteredData = sortedDataJadwal.filter((row) => {
    if (!searchTerm || searchTerm === "") return true;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    //const searchWords = lowercasedSearchTerm.split(" ").filter(Boolean);
    const searchWords =
      lowercasedSearchTerm
        .match(/"[^"]+"|\S+/g)
        ?.map((word) => word.replace(/"/g, "")) || [];

    return searchWords.every(
      (word) =>
        row.materi.nama?.toLowerCase().includes(word) ||
        row.jadwalNarasumber.some((narsum) =>
          narsum.narasumber.nama?.toLowerCase().includes(word)
        )
    );
  });

  useEffect(() => {
    if (!kegiatanId) {
      return;
    }
    const getJadwal = async () => {
      const dataJadwal = await getObPlainJadwalByKegiatanIdWithStatusDisetujui(
        kegiatanId
      );
      //const dataJadwal = await getJadwalByKegiatanId(kegiatanId);
      setDataJadwal(dataJadwal);
    };
    getJadwal();
  }, [kegiatanId]);

  if (!kegiatanId) {
    return null;
  }

  const handleEdit = (row: Row<ObjPlainJadwalKelasNarasumber>) => {};
  const handleDelete = (row: ObjPlainJadwalKelasNarasumber) => {};

  const handleGenerate = (jadwalId: string) => {
    console.log(jadwalId);
  };

  const columns: ColumnDef<ObjPlainJadwalKelasNarasumber>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: { className: "w-[50px]" },
    },
    {
      accessorKey: "kelas.nama",
      header: "Kelas",
      cell: (info) => info.getValue(),
      footer: "Kelas",
    },
    {
      accessorKey: "materi.nama",
      header: "Kelas",
      cell: (info) => info.getValue(),
      footer: "Kelas",
    },
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return date.toLocaleDateString();
      },
      footer: "Kelas",
    },
    {
      accessorKey: "_additionalKolomAksi",
      header: "Aksi",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              className="gap-2"
              onClick={() => {
                handleGenerate(row.original.id);
              }}
            >
              <WandSparkles size={20} />
              <span>Generate</span>
            </Button>
          </div>
        );
      },
      meta: { isKolomAksi: true, className: "w-[100px]" },
      enableSorting: false, // Disable sorting for this column
    },
  ];

  return (
    <div>
      <TabelGenericWithoutInlineEdit
        data={filteredData}
        columns={columns}
        frozenColumnCount={0}
        isEditing={isEditing}
        editableRowId={editableRowId}
      />
    </div>
  );
};

export default TabelJadwalHonorarium;
