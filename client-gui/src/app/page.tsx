"use client";
// Example: /client-gui/src/app/page.tsx
import React, { useState } from "react";
import Settings from "./_components/settings";
import Wrap from "./_components/canvas/wrap";
import  useImageStore  from "./_store/img";

export default function Home() {
  const imageUrl = useImageStore((s) => s.imageUrl)
    const setImageUrl = useImageStore((s) => s.setImageUrl)

  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return; 
    const formData = new FormData(); 
    formData.append("img", file); 
    const res = await fetch("http://127.0.0.1:8000/gui/upload", {
      method: "POST",
      body: formData,
    }); 
    if (res.ok) {
        const data = await res.json(); 
        console.log("Upload successful:", data);  
        console.log(data.url)
        //update url state for constant rendering; 
        setImageUrl(`http://127.0.0.1:8000${data.url}`);
    } else {
        console.error("Upload failed:", res.status, await res.text());
    }
    // handle response (e.g., show filename or success message)
  };

  return (
    <div>
      <Settings onChange={setSelectedOps} /> 
      <button>
        Run
      </button>
      <Wrap />
            <div>
        <p>Use Mouse To Draw</p>
         <p>Hold "Space" and drag to change position</p>
          <p>Pinch to zoom</p>
      </div>
      <input type="file" onChange={handleUpload}></input>
    </div>
  );
}