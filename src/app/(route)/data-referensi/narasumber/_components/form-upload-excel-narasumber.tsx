"use client";
import { importExcelNarasumber } from "@/actions/excel/narasumber";
import ExcelContainer, {
  ParseResult,
} from "@/approute/data-referensi/_components/excel-container";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  columnsWithEmptyValueAllowed,
  extractFromColumns,
} from "@/constants/excel/narasumber";
import {
  excelDataReferensi,
  excelDataReferensiSchema,
} from "@/zod/schemas/excel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const FormUploadExcelNarasumber = () => {
  const form = useForm<excelDataReferensi>({
    resolver: zodResolver(excelDataReferensiSchema),
  });
  const [data, setData] = useState<ParseResult | null>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const {
    setValue,
    reset,
    resetField,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
  } = form;

  const onSubmit = async (data: excelDataReferensi) => {
    // disubmit excel / data ke backend ?
    // harus tidak ada error dulu

    if (!data.file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file);
    const importedData = await importExcelNarasumber(formData);
    if (importedData.success) {
      toast.success("Data berhasil diimport");
      console.log("Data berhasil diimport", importedData.data);
      // always reset the form after submit
      reset(); // this will reset file input, then chaining to reset TabelDariExcel
      setIsReadyToSubmit(false);
    } else {
      toast.error(`Data gagal diimport ${importedData.message}`);
      console.log("Data gagal diimport ", importedData.error);
      // kalo gagal harusnya bisa chek dengan cari mana yg sudah ada di db
    }

    console.log(data);
  };

  const onParse = (data: ParseResult | null) => {
    console.log("onParse", data);
    setData(data);
    if (data) {
      console.log("data", data.shouldNotEmpty);
      setIsReadyToSubmit(Object.keys(data.shouldNotEmpty).length === 0);
    } else {
      console.log("Not ready to submit");
      setIsReadyToSubmit(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ExcelContainer
                  templateXlsx="/download/template-excel/narasumber"
                  name={field.name}
                  value={field.value}
                  extractFromColumns={extractFromColumns}
                  columnsWithEmptyValueAllowed={columnsWithEmptyValueAllowed}
                  onParse={onParse}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex mt-8">
          {isReadyToSubmit && <Button type="submit">Submit</Button>}
        </div>
      </form>
    </Form>
  );
};

export default FormUploadExcelNarasumber;
