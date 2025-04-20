"use client";
import { simpanRole } from "@/actions/role";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Role, roleSchema } from "@/zod/schemas/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GridPemission } from "./grid-permission";

interface FormPermissionsProps {
  resources: string[];
  role?: Partial<Role> | null;
  availablePermissions: string[];
}

const actions = [
  "create:any",
  "create:own",
  "read:any",
  "read:own",
  "update:any",
  "update:own",
  "delete:own",
  "delete:any",
];

const FormPermissions = ({
  resources,
  role,
  availablePermissions,
}: FormPermissionsProps) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions || []
  );

  const form = useForm<Role>({
    resolver: zodResolver(roleSchema),
    defaultValues: role
      ? role
      : {
          name: "",
        },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const hanleOnChangePermission = (permissions: string[]) => {
    console.log("permissions", permissions);
    // setSelectedPermissions(permissions);
    setValue("permissions", permissions);
  };

  const onSubmit = async (data: Role) => {
    try {
      const role = await simpanRole(data);
      if (role.success) {
        toast.success(`Berhasil menyimpan data role ${role.data?.name}`);
        form.reset();
      } else {
        toast.error("Gagal menyimpan data role");
      }
    } catch (error) {
      toast.error("Gagal menyimpan data role");
    }
    console.log(data);
  };

  return (
    <div className="overflow-y-auto flex flex-col gap-2 p-4 rounded-md">
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
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
          <div>
            <GridPemission
              resources={resources}
              actions={actions}
              permissions={role?.permissions || []}
              availablePermissions={availablePermissions}
              onChange={hanleOnChangePermission}
            />
          </div>
          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Simpan {isSubmitting && <Loader className="animate-spin ml-2" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FormPermissions;
