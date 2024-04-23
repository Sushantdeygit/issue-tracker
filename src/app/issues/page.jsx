"use client";
import React from "react";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

const IssuePage = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <Button className="bg-white border-black border  p-5 rounded-md text-xl font-semibold text-black">
        <Link href="/issues/new">New issue</Link>
      </Button>
    </div>
  );
};

export default IssuePage;
