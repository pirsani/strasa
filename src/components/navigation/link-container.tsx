"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinkContainerProps {
  children: React.ReactNode;
  className?: string;
  href: string;
}

export const LinkContainer = ({ children, href }: LinkContainerProps) => {
  const pathname = usePathname();
  return <Link href={href}>{children}</Link>;
};
