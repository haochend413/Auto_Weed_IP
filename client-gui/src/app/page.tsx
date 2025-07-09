"use client";
// Example: /client-gui/src/app/page.tsx
import React, { useState } from "react";
import Settings from "./_components/settings";
import Wrap from "./_components/canvas/wrap";

export default function Home() {
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const handleRun = async (images: File[]) => {
    //if multiple, use "all", otherwise use the selected one
    let operation = "all";
    if (selectedOps.length === 1) { 
      operation = selectedOps[0];
    } 

    const formData = new FormData();
    images.forEach(img => formData.append("images", img));
 
    const res = await fetch(`http://localhost:8000/${operation}`, {
      method: "POST",
      body: formData,
    });
    //handle response
  };

  return (
    <div>
      <Settings onChange={setSelectedOps} />
      <button>
        Run
      </button>
      <Wrap />
    </div>
  );
}