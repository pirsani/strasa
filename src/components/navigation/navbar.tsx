import { UserButton } from "@/components/user/user-button";
import SelectTahunAnggaran from "../select-tahun-anggaran";
import NamaSatker from "./satker";
import Search from "./search";

const Navbar = () => {
  return (
    <nav className="p-2 flex gap-4 w-full flex-auto bg-gray-100">
      <div className="w-full">
        <Search />
      </div>
      <div className="mx-auto">
        <NamaSatker />
      </div>
      <div className="mx-2">
        <SelectTahunAnggaran />
      </div>
      <div className="mx-auto right-0">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
