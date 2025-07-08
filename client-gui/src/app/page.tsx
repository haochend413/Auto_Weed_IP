"use client"
import Image from "next/image";
import Settings from "./_components/settings";
import Wrap from "./_components/canvas/wrap";

export default function Home() {
  return (
    <div>
      <Settings />
      <Wrap />
    </div>
  );
}
