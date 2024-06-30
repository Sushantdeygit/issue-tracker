"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IoBug } from "react-icons/io5";
import { usePathname } from "next/navigation";
const Navbar = () => {
  const currentPath = usePathname();
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 0) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`flex justify-between items-center w-full p-5 px-10  ${
        isSticky ? "sticky top-0 shadow-md  backdrop-blur-xl z-10 " : ""
      }`}
    >
      <div className="flex justify-center items-center gap-2">
        <IoBug size={30} />
        <h1 className="font-bold  text-xl sm:text-2xl lg:text-4xl">
          Issue Tracker
        </h1>
      </div>
      {/* <div className="flex justify-center items-center gap-10">
        <Link href="/" className="font-semibold text-xl">
          Dashboard
        </Link>
        <Link href="/issues" className=" font-semibold text-xl">
          Issues
        </Link>
      </div> */}
      <Link href="/issues" className=" font-semibold text-xl">
        Issues
      </Link>
    </div>
  );
};

export default Navbar;
