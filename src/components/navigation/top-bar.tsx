import Link from "next/link";
import { SidebarTrigger } from "../ui/sidebar";
import Navbar from "./navbar";

const TopBar = () => {
  return (
    <div className="bg-gray-100 w-full h-[76px] flex flex-row fixed inset-y-0 z-50 border-0 border-b border-gray-200 shadow-sm">
      <div className="flex flex-row h-full gap-2 w-16 md:w-64 items-center ">
        <SidebarTrigger className="pl-4" />
        <div className="h-full w-full hidden md:block">
          <Link
            href={"/"}
            className="text-xl font-bold font-sans h-full flex items-center justify-start text-primary"
            type="button"
          >
            STRASA
          </Link>
        </div>
      </div>
      <div className="w-full p-2 md:p-0">
        <Navbar />
      </div>
    </div>
  );
};

export default TopBar;
