import { UserButton } from "@/components/user/user-button";
import SelectTahunAnggaran from "../select-tahun-anggaran";
import NamaSatker from "./satker";
import Search from "./search";

const Navbar = () => {
  return (
    <nav className="p-2 flex items-center gap-4">
      <div className="w-full">
        <Search />
      </div>
      <div>
        <NamaSatker />
      </div>
      <div className="mx-2">
        <SelectTahunAnggaran />
      </div>
      <div className="mx-2">
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
