"use client";
import { changePassword } from "@/actions/pengguna/change-password";
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
import { ChangePassword, changePasswordSchema } from "@/zod/schemas/pengguna";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const FormChangePassword = () => {
  const form = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      rePassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, isSubmitSuccessful },
  } = form;

  const onSubmit = async (data: ChangePassword) => {
    console.log("data", data);
    const response = await changePassword(data);
    if (!response.success) {
      form.setError("currentPassword", {
        type: "manual",
        message: response.message,
      });
    } else {
      toast.success("Password berhasil diubah");
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password sekarang</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
              <FormLabel>Ketik Ulang Password baru</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button
            type="submit"
            disabled={!isDirty || !isValid || isSubmitting}
            className="w-full"
          >
            Ubah Password {isSubmitting ? "..." : ""}
          </Button>
        </div>
      </form>
    </Form>
  );
};
