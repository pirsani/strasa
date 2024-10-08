import LoginForm from "@/components/form/login";
import Image from "next/image";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-2 sm:p-24 w-full">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <div className="flex flex-col w-full">
          <h1 className="text-4xl font-bold">Panda</h1>
          <p className="text-lg font-light">
            Pengelolaan Administrasi Perbendaharaan
          </p>
          <div className="py-10 flex flex-col sm:flex-row gap-6 h-auto">
            <div className="w-full sm:w-1/2 h-52 sm:h-96 relative">
              <Image
                src="/images/hero-1.png"
                alt="Panda"
                fill
                className="rounded-lg object-cover"
                priority
                placeholder="blur"
                blurDataURL="/images/hero-1-blur.png" // Add a small, low-quality version of the image
              />
            </div>

            <div className="w-full sm:w-1/2 h-auto flex flex-grow">
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
