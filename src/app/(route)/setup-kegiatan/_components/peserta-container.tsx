import { Button } from "@/components/ui/button";
import { emptyAllowed } from "@/constants/excel/peserta";
import { ParseExcelResult } from "@/utils/excel/parse-excel";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { createId } from "@paralleldrive/cuid2";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { utils, write } from "xlsx";
import InputFileXlsx from "./input-file-xlsx";
import TabelPeserta from "./tabel-peserta";

interface PesertaContainerProps {
  // Define the props for PesertaContainer
  fieldName: string;
  pesertaXlsxCuid: string;
  folder: string; // cuid untuk referensi folder penyimpanan file
  value?: File | null;
}
const PesertaContainer = ({
  fieldName,
  pesertaXlsxCuid,
  folder,
  value,
}: PesertaContainerProps) => {
  const { setValue, getValues, watch } = useFormContext();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const emptyAllowed = ["Eselon", "ID", "Lainny"]; // kolom yang boleh kosong
  const [emptyValues, setEmptyValues] = useState<Record<number, string[]>>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);

  // Use a ref to store the folderCuid
  const fileCuidRef = useRef(createId() + ".xlsx");
  const fileCuid = fileCuidRef.current;
  setValue(pesertaXlsxCuid, fileCuid);

  const handleOnChange = async (parseExcelResult: ParseExcelResult) => {
    if (parseExcelResult.rows.length > 0) {
      setData(parseExcelResult.rows);
      setEmptyValues(parseExcelResult.emptyValues);
      setMissingColumns(parseExcelResult.missingColumns);
      //console.log(data);
      const filename = await exportPesertaXlsx(
        folder,
        fileCuid,
        parseExcelResult
      );
    } else {
      console.log("Data is empty");
      setData([]);
      setEmptyValues([]);
      setMissingColumns([]);
    }
  };

  // Clear data when value is empty ini untuk menghapus data ketika value kosong atau di reset dari parent component
  // component ini tidak akan merender file input dari parent component
  // hanya akan merender file input yg di kelola oleh component ini
  useEffect(() => {
    if (!value) {
      setData([]);
    }
  }, [value]);

  const extractFromColumns = [
    "ID",
    "Nama",
    "NIP",
    "Golongan/Ruang",
    "Jabatan",
    "Eselon",
    "NIK",
    "NPWP",
    "Nama Rekening",
    "Bank",
    "Nomor Rekening",
  ];

  return (
    <div className="mt-4">
      <h1 className="text-lg font-semibold mb-2">Peserta</h1>
      <div className="flex flex-row items-center gap-2 mb-2">
        <Button variant="outline">
          <Link href="/templates/peserta.xlsx">Unduh template xls peserta</Link>
        </Button>
        <span>atau</span>
      </div>
      <InputFileXlsx
        onChange={handleOnChange}
        maxColumns={9}
        name={fieldName}
        extractFromColumns={extractFromColumns}
      />

      {Object.keys(emptyValues).length > 0 && (
        <WarningOnEmpty
          emptyValues={emptyValues}
          missingColumns={missingColumns}
        />
      )}
      {data.length > 0 && <TabelPeserta data={data} />}
    </div>
  );
};

const WarningOnEmpty = ({
  missingColumns,
  emptyValues,
}: {
  missingColumns: string[];
  emptyValues: Record<number, string[]>;
}) => {
  const result = splitEmptyValues(emptyValues, emptyAllowed);
  const { shouldNotEmpty, allowEmpty } = result;
  const rows = Object.entries(shouldNotEmpty);
  const hasMissingColumns = missingColumns.length > 0;
  const hasEmptyValues = rows.length > 0;

  if (!hasMissingColumns && !hasEmptyValues) {
    return null;
  }

  return (
    <div className="bg-red-500 text-white p-4">
      <div className="font-bold">Peringatan!</div>

      {hasMissingColumns && (
        <div>
          <div className="py-2">
            <div>Terdapat kolom yang hilang</div>
            <div className="font-bold">Kolom yang harus ditambahkan</div>

            <ul>
              {missingColumns.map((col) => (
                <li key={col}>{col}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {hasEmptyValues && (
        <>
          <div>
            Terdapat kolom yang kosong, silahkan periksa kembali data peserta.
          </div>
          <div className="">
            <div className="font-bold">Kolom yang harus diisi:</div>
            {
              <ul>
                {rows.map(([rowIndex, columns]) => (
                  <li key={rowIndex}>
                    Baris {parseInt(rowIndex) + 1}: {columns.join(", ")}
                  </li>
                ))}
              </ul>
            }
          </div>
        </>
      )}
    </div>
  );
};

export async function exportPesertaXlsx(
  folderCuid: string,
  fileCuid: string,
  parseResult: ParseExcelResult
) {
  const result = splitEmptyValues(parseResult.emptyValues, emptyAllowed);
  const { shouldNotEmpty, allowEmpty } = result;
  const hasMissingColumns = parseResult.missingColumns.length > 0;
  const rowsWithEmptyValues = Object.entries(shouldNotEmpty);
  const hasEmptyValues = rowsWithEmptyValues.length > 0;
  if (hasMissingColumns || hasEmptyValues) {
    return null;
  }

  const data = parseResult.rows;
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Peserta");
  const buf = write(wb, { bookType: "xlsx", type: "buffer" });
  // return buf;
  const newExcel = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // uploade file to server
  const formData = new FormData();
  const filename = fileCuid;
  formData.append("file", newExcel, "peserta.xlsx");
  formData.append("filename", filename);
  formData.append("folder", folderCuid);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    toast.info("File Peserta uploaded");
    return filename;
  } else {
    toast.error("Failed to upload Peserta file");
  }
}

export default PesertaContainer;
