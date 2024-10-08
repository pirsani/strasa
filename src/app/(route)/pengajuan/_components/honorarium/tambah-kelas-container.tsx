import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Kelas, kelasSchema } from "@/zod/schemas/kelas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Grid2X2, Plus } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface TambahKelasContainerProps {
  onSubmit?: (data: Kelas) => void;
  className?: string;
}

const TambahKelasContainer = ({
  onSubmit: parentOnSubmit = () => {},
  className,
}: TambahKelasContainerProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<Kelas>({
    resolver: zodResolver(kelasSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit: SubmitHandler<Kelas> = async (data) => {
    console.log(data);
    // Call API to save data
    // Close dialog
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="gap-1">
          <Plus size={12} />
          <span className="hidden sm:block">Kelas</span>
          <Grid2X2 size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kelas</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan kelas baru
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="kode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode</FormLabel>
                  <FormControl>
                    <Input placeholder="[PDK-75-A]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama</FormLabel>
                  <FormControl>
                    <Input placeholder="Kelas [A-Z]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div
              className={cn(
                "flex flex-col sm:flex-row sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-6"
              )}
            >
              <Button type="submit">Submit</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TambahKelasContainer;
