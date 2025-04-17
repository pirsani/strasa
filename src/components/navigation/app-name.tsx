"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "../ui/sidebar";

const AppName = () => {
  const sidebar = useSidebar();
  const { state } = sidebar;

  return (
    <div
      className={cn(
        "w-full h-[56px] items-center  flex",
        state === "collapsed" && "justify-center"
      )}
    >
      <Link
        href={"/"}
        className={cn(
          "px-4 text-xl font-bold font-sans h-full flex items-center justify-start text-primary",
          state === "collapsed" && "hidden"
        )}
        type="button"
      >
        STRASA
      </Link>
      <Image
        src={"/favicon.ico"}
        alt="logo"
        width={16}
        height={16}
        className={cn(
          "w-8 h-8 rounded-full bg-white border border-gray-200 ",
          state !== "collapsed" && "hidden"
        )}
      />
    </div>
  );
};

export default AppName;
