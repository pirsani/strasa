"use client";
import { simpanDataRole } from "@/actions/role";
//import SelectKegiatan from "@/components/form/select-kegiatan";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

import CummulativeErrors from "@/components/form/cummulative-error";
import SelectPermissions from "@/components/form/select-permissions";
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
import { Role, roleSchema } from "@/zod/schemas/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

interface FormRoleProps {
  onCancel?: () => void;
  handleFormSubmitComplete?: (isSuccess: Boolean) => void;
  className?: string;
  role?: Partial<Role> | null;
}
const FormRole = ({
  onCancel,
  handleFormSubmitComplete,
  className,
  role,
}: FormRoleProps) => {
  console.log("role passed from props", role);
  const form = useForm<Role>({
    resolver: zodResolver(roleSchema),
    defaultValues: role
      ? role
      : {
          name: "",
        },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;
  const onSubmit = async (data: Role) => {
    try {
      const role = await simpanDataRole(data);
      if (role.success) {
        toast.success(`Berhasil menyimpan data role ${role.data?.name}`);
        form.reset();
        handleFormSubmitComplete?.(role.success);
      } else {
        toast.error("Gagal menyimpan data role");
      }
    } catch (error) {
      toast.error("Gagal menyimpan data role");
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Role</FormLabel>
                  <FormControl>
                    <Input placeholder="pelaksana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="narasumberIds">Permission</FormLabel>
                  <FormControl>
                    <SelectPermissions
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

            <div>
              <CummulativeErrors errors={errors} />
            </div>

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

export default FormRole;
