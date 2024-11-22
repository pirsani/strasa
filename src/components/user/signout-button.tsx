"use client";
import { signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full">
      Sign Out
    </button>
  );
}
