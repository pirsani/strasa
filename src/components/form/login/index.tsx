"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { UncomplexLoginSchema } from "@/zod/schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Phone } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Input from "./input";

export type UncomplexLogin = z.infer<typeof UncomplexLoginSchema>;

const LoginForm = () => {
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/dashboard";
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<UncomplexLogin>({
    resolver: zodResolver(UncomplexLoginSchema),
  });

  const onSubmit = async (data: UncomplexLogin) => {
    console.log(data);
    try {
      const response = await signIn("credentials", {
        //redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (!response?.error) {
        router.push(callbackUrl);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 border rounded-sm">
      <div className="flex flex-col items-center gap-2 mb-4">
        {/* <Image
          src="/images/hero-1.png"
          alt="Logo"
          width={72}
          height={72}
          className=" rounded-full border-2 border-gray-300"
        /> */}
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="email"
          label="Username"
          type="text"
          register={register}
          error={errors.email}
        />
        <Input
          id="password"
          label="password"
          type="password"
          register={register}
          error={errors.password}
        />
        <Button className=" w-full py-6" disabled={isLoading} type="submit">
          Sign in
          {isLoading && (
            <Loader className="ml-2 spin-in" size={24} color="white" />
          )}
        </Button>
        <Link
          href="/#"
          className={buttonVariants({
            variant: "link",
            className: "gap-1.5 w-full text-blue-500",
          })}
        >
          {`Tidak punya akun? hubungi admin`}
          <Phone className="h-4 w-4 ml-1" />
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;
