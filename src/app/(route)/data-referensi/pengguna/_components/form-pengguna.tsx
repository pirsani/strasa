"use client";
import { simpanDataPengguna } from "@/actions/pengguna";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import Required from "@/components/form/required";
import { SelectRoles } from "@/components/form/select-roles";
import SelectUnitKerja from "@/components/form/select-unit-kerja";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Pengguna, penggunaSchema } from "@/zod/schemas/pengguna";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormPenggunaProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  pengguna?: Partial<Pengguna> | null;
}
const FormPengguna = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  pengguna,
}: FormPenggunaProps) => {
  const form = useForm<Pengguna>({
    resolver: zodResolver(penggunaSchema),
    defaultValues: pengguna
      ? {
          ...pengguna,
          password: "", // Ensure password is empty initially
          rePassword: "", // Ensure rePassword is empty initially
        }
      : {
          name: "",
          NIP: "",
          email: "",
          password: "",
          rePassword: "",
        },
  });

  const {
    handleSubmit,
    formState: { errors },
    getValues,
  } = form;
  const hasErrors = Object.keys(errors).length > 0;
  const onSubmit = async (data: Pengguna) => {
    console.log("Form data before validation:", getValues());

    console.log(data);
    try {
      const pengguna = await simpanDataPengguna(data);
      if (pengguna.success) {
        toast.success(
          `Berhasil menyimpan data pengguna ${pengguna.data?.name}`
        );
        form.reset();
        handleFormSubmitComplete?.(pengguna.success);
      } else {
        toast.error(
          `Gagal menyimpan data pengguna ${pengguna.message}, error-code:${pengguna.error}`
        );
      }
    } catch (error) {
      toast.error("Gagal menyimpan data pengguna");
    }
    console.log(data);
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="organisasiId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unit Kerja</FormLabel>
                  <FormControl>
                    <SelectUnitKerja
                      onChange={field.onChange}
                      value={field.value ?? ""}
                      fieldName={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <SelectRoles
                      isMulti
                      inputId={field.name}
                      onChange={field.onChange}
                      values={field.value ?? []} // Ensure value is passed correctly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="fulan"
                      {...field}
                      value={field.value ?? ""} // Ensure value is never null
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="NIP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    NIP
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="fulan"
                      {...field}
                      value={field.value ?? ""} // Ensure value is never null
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email
                    <Required />
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="fulan@pirsani.id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="1 2 3"
                      {...field}
                      className="w-full"
                      value={field.value ?? ""} // Ensure value is never null
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rePassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>re-enter Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
                      {...field}
                      className="w-full"
                      value={field.value ?? ""} // Ensure value is never null
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasErrors && (
              <div className="bg-red-500 text-white mt-4 p-2">
                {Object.keys(errors).map((key) => (
                  <p key={key}>{errors[key as keyof typeof errors]?.message}</p>
                ))}
              </div>
            )}

            <div
              className={cn(
                "flex flex-col sm:flex-row  sm:justify-end gap-2 mt-6"
              )}
            >
              <Button type="submit">Simpan</Button>
              <Button type="button" variant={"outline"} onClick={onCancel}>
                Batal
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormPengguna;
