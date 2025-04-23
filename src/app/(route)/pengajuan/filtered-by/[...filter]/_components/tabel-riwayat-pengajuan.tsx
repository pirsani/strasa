import { TabelGenericWithoutInlineEdit } from "@/components/tabel-generic-without-inline-edit";
import { RiwayatPengajuanIncludePengguna } from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { ColumnDef } from "@tanstack/react-table";

interface TabelRiwayatPengajuanProps {
  data: RiwayatPengajuanIncludePengguna[] | null;
  filterStatus?: STATUS_PENGAJUAN | null;
}
export const TabelRiwayatPengajuan = ({
  data,
  filterStatus,
}: TabelRiwayatPengajuanProps) => {
  const columns: ColumnDef<RiwayatPengajuanIncludePengguna>[] = [
    {
      id: "rowNumber",
      header: "#",
      // cell: (info) => info.row.index + 1, // Display row number (1-based index)
      footer: "#",
      meta: {
        className: "w-[50px]",
      },
    },
    {
      id: "kegiatan.nama",
      header: "Nama Kegiatan",
      accessorKey: "kegiatan.nama",
    },
    {
      id: "jenis",
      header: "Jenis Pengajuan",
      accessorKey: "jenis",
    },
  ];

  return (
    <div>
      {data && data.length > 0 && (
        <TabelGenericWithoutInlineEdit data={data} columns={columns} />
      )}
    </div>
  );
};

export default TabelRiwayatPengajuan;
