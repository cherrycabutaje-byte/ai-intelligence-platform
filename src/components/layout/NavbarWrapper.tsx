"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hideOn = ["/", "/login", "/signup"];
  if (hideOn.includes(pathname)) return null;
  return <Navbar />;
}
