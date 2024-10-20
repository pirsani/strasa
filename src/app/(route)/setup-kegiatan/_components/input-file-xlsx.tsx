import FormFileUpload from "@/components/form/form-file-upload";
import parseExcel, { ParseExcelResult } from "@/utils/excel/parse-excel";

interface InputFileXlsxProps {
  name: string;
  onChange: (parseExcelResult: ParseExcelResult) => void;
  maxColumns?: number; // Add maxColumns prop
  extractFromColumns: string[];
  dateColumns?: string[]; // Columns that contain date values
}
const InputFileXlsx = ({
  name,
  onChange,
  maxColumns = 8,
  extractFromColumns,
  dateColumns = [],
}: InputFileXlsxProps) => {
  // const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
  const handleOnChange = async (file: File | null) => {
    //const file = event.target.files?.[0];
    if (file) {
      try {
        console.log("[extractFromColumns]", extractFromColumns);
        //const extractFromColumns = extractFromColumns;
        const parsedData = await parseExcel(file, {
          extractFromColumns: extractFromColumns,
          dateColumns: dateColumns,
        });
        onChange(parsedData);
        console.log(
          "Parsed Data: [missingColumns]",
          parsedData.missingColumns || []
        );
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("File is empty");
      onChange({ rows: [], emptyValues: [], missingColumns: [] });
    }
  };

  return (
    <FormFileUpload
      name={name}
      allowedTypes={[
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]}
      onFileChange={handleOnChange}
      className="bg-white"
    />
  );
};

export default InputFileXlsx;
