"use client";
import { importExcelSbmHonorarium } from "@/actions/excel/sbm/honorarium";
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
} from "@/constants/excel/sbm-honorarium";
import {
  excelDataReferensi,
  excelDataReferensiSchema,
} from "@/zod/schemas/excel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const FormUploadExcelSbmHonorarium = () => {
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
    const importedData = await importExcelSbmHonorarium(formData);
    if (importedData.success) {
      toast.success("Data berhasil diimport");
      console.log("Data berhasil diimport", importedData.data);
      setData(null);
      setIsReadyToSubmit(false);
      reset();
    } else {
      console.log("Data gagal diimport ", importedData.error);
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

  useEffect(() => {
    setIsReadyToSubmit(
      data ? Object.keys(data.shouldNotEmpty).length === 0 : false
    );
  }, [data]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="border rounded-sm p-2">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem className="">
              <FormControl>
                <ExcelContainer
                  templateXlsx="/download/template-excel/sbm-honorarium"
                  name={field.name}
                  value={field.value}
                  extractFromColumns={extractFromColumns}
                  columnsWithEmptyValueAllowed={columnsWithEmptyValueAllowed}
                  onParse={onParse}
                  placeholder="Pilih dan unggah file excel untuk import data"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isReadyToSubmit && (
          <div className="flex my-6 w-full justify-center">
            <Button type="submit" className="w-full w-1/3">
              Import {data?.rows.length} data
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default FormUploadExcelSbmHonorarium;
