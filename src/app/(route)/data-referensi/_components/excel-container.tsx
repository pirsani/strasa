import InputFileXlsx from "@/components/form/input-file-xlsx";
import TabelDariExcel from "@/components/tabel-dari-excel";
import { Button } from "@/components/ui/button";
import { ParseExcelResult } from "@/utils/excel/parse-excel";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { extend } from "lodash";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface ParseResult extends ParseExcelResult {
  shouldNotEmpty: Record<number, string[]>;
  allowEmpty: Record<number, string[]>;
}

interface ExcelContainerProps {
  // Define the props for ExcelContainer
  name: string;
  templateXlsx: string;
  value?: File | null;
  extractFromColumns: string[];
  columnsWithEmptyValueAllowed?: string[];
  onChange?: (file: File | null) => void;
  onParse?: (data: ParseResult | null) => void;
  placeholder?: string;
}

const ExcelContainer = ({
  name,
  value,
  templateXlsx,
  extractFromColumns = [],
  columnsWithEmptyValueAllowed = [],
  onChange: parentOnChange = () => {},
  onParse = () => {},
  placeholder,
}: ExcelContainerProps) => {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [emptyValues, setEmptyValues] = useState<Record<number, string[]>>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [shouldNotEmpty, setshouldNotEmpty] = useState<
    Record<number, string[]>
  >([]);
  const [allowEmpty, setAllowEmpty] = useState<Record<number, string[]>>([]);

  const handleOnChange = (parseExcelResult: ParseExcelResult) => {
    console.log("parseExcelResult", parseExcelResult);
    if (
      parseExcelResult.rows.length > 0 ||
      parseExcelResult.missingColumns.length > 0
    ) {
      setData(parseExcelResult.rows);

      // check if there is no missing columns and empty values
      const result = splitEmptyValues(
        parseExcelResult.emptyValues,
        columnsWithEmptyValueAllowed
      );
      const { shouldNotEmpty, allowEmpty } = result;
      setshouldNotEmpty(shouldNotEmpty);
      setAllowEmpty(allowEmpty);
      setEmptyValues(parseExcelResult.emptyValues);
      setMissingColumns(parseExcelResult.missingColumns);
      console.log(
        "parseExcelResult.missingColumns",
        parseExcelResult.missingColumns
      );

      // if there is no shouldNotEmpty, pass the data to parent component
      if (Object.keys(shouldNotEmpty).length === 0) {
        // console.log("Data is not empty");
      }
      const finalResult: ParseResult = extend(parseExcelResult, {
        shouldNotEmpty,
        allowEmpty,
      });
      onParse(finalResult);
    } else {
      console.log("[parseExcelResult] is empty");
      // Clear data when value is empty
      onParse(null);
      parentOnChange && parentOnChange(null);
      setData([]);
      setEmptyValues({});
      setMissingColumns([]);
      console.log(value);
    }
  };

  // Clear data when value is empty ini untuk menghapus data ketika value kosong atau di reset dari parent component
  // component ini tidak akan merender file input dari parent component
  // hanya akan merender file input yg di kelola oleh component ini
  useEffect(() => {
    if (!value) {
      setData([]);
      setEmptyValues({});
      setMissingColumns([]);
    }
  }, [value]);

  return (
    <div className="w-full mt-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-row items-center gap-4 mb-2">
          <Button>
            <Link href={templateXlsx}>Unduh template xlsx</Link>
          </Button>
          <span>atau</span>
        </div>
        <div className="w-full xl:w-1/2">
          <InputFileXlsx
            onChange={handleOnChange}
            maxColumns={9}
            name={name}
            extractFromColumns={extractFromColumns}
            placeholder={placeholder}
          />
        </div>
      </div>

      {(Object.keys(emptyValues).length > 0 || missingColumns.length > 0) && (
        <WarningOnEmpty
          shouldNotEmpty={shouldNotEmpty}
          allowEmpty={allowEmpty}
          missingColumns={missingColumns}
        />
      )}
      {data.length > 0 && <TabelDariExcel data={data} />}
    </div>
  );
};

const WarningOnEmpty = ({
  missingColumns,
  shouldNotEmpty,
  allowEmpty,
}: {
  missingColumns: string[];
  shouldNotEmpty: Record<number, string[]>;
  allowEmpty: Record<number, string[]>;
}) => {
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

            <ul className="flex flex-wrap gap-2">
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
            Terdapat kolom yang kosong, silahkan periksa kembali data anda.
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

export default ExcelContainer;
