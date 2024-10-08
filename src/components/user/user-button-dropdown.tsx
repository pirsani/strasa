"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react";
//import { signOut } from "next-auth/react";
import Link from "next/link";
import { SignOut } from "./signout-button";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
}

interface IUserButtonProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    nip?: string | null;
    unitKerjaId?: string | null;
    unitKerjaNama?: string | null;
    roles?: string[] | null;
    permissions?: string[] | null;
  };
}
const UserButtonDropdown = ({ user }: IUserButtonProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="items-center flex outline-none">
      <Avatar className="w-9 h-9">
        <AvatarImage
          className="rounded-full w-9 h-9 border-2 border-gray-300"
          src={user.image ? "/images/avatar.png" : "/images/avatar.png"}
          sizes="9"
        />
        <AvatarFallback className="w-9 h-9 text-sm">
          {getInitials(user.name ?? user.email ?? "Guest")}
        </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="mr-2">
      <DropdownMenuLabel>
        {user.name ?? user.email ?? "Unknown"}
      </DropdownMenuLabel>
      <DropdownMenuLabel className="font-light">
        Unit: {user.unitKerjaNama ?? "Guest"}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="flex items-center gap-x-2 hover:cursor-pointer">
          <UserIcon size={9} />
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="flex items-center gap-x-2 hover:cursor-pointer">
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default UserButtonDropdown;
