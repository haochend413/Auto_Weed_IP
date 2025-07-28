"use client";
// Example: /client-gui/src/app/page.tsx
import React, { useState, useEffect} from "react";
import Settings from "./_components/settings";
import Wrap from "./_components/canvas/wrap";
import  useImageStore  from "./_store/img";
import useServerStore from "./_store/server";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


export default function Home() {
  const imageUrl = useImageStore((s) => s.imageUrl)
  const setImageUrl = useImageStore((s) => s.setImageUrl)
  const [folded, setFolded] = useState(false);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  const setBaseServerURL = useServerStore((s) => s.setBaseServerURL) 

  // startup setting to get the right url
  useEffect(() => {
    // Try possible backend URLs at startup 
    const urls = [

      //after construction, need to register this to a stable deployer;  
      // "http://10.192.227.142", // for illinoisNet
      // "http://192.168.10.252:8000", // for VUE // this will not work due to mixed https / http
      "http://localhost:8000", //local 
    ];
    (async () => {
      for (const url of urls) { 
        try {
          const res = await fetch(url + "/");
          if (res.ok) {
            setBaseServerURL(url);
            console.log("Connected to backend:", url);
            break;
          }
        } catch (err) {
          console.log("Connection failed: " + url)
        }
      }
    })();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return; 
    const formData = new FormData();  
    formData.append("img", file); 
    const res = await fetch(baseServerURL + "/gui/upload", {
      method: "POST", 
      body: formData,
    }); 
    if (res.ok) {
        const data = await res.json(); 
        console.log("Upload successful:", data);  
        console.log(data.url)
        //update url state for constant rendering; 
        setImageUrl(baseServerURL + `${data.url}`);
    } else {
        console.error("Upload failed:", res.status, await res.text());
    }

    

    const img_path = baseServerURL + "/raw_upload/" + file.name; 
    const image = {
      img_path: img_path,
      regions: [],
      borders: [],
      classification: "none", 
    }
    const res2 = await fetch(baseServerURL + "/db/putImage", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(image)
    });
    if (res2.ok) {
        const data = await res2.json(); 
        console.log("Upload successful:", data);  
        console.log(data.url)
        //update url state for constant rendering; 
        setImageUrl(baseServerURL + `${data.url}`);
    } else {
        console.error("Upload failed:", res2.status, await res2.text());
    }
  
  };
 


  return (
    <div className="fixed inset-0 w-screen h-screen min-w-0 min-h-0 bg-[#FFFFFF] font-sans">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full max-w-full max-h-full rounded-none border-none"
      >
        <ResizablePanel defaultSize={12} className="h-full min-w-[0px] max-w-[600px] bg-[#222222] border-r-2 border-blue-100 shadow-md flex flex-col p-8">
          <div
            style={{
              border: "1px solid black",
              borderRadius: 10, 
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#0003adff", 
              alignItems: "center",
              marginBottom: 20, 
              borderColor: "#ff7700ff", 
              
            }}
          >
            <h1   style={{
                  fontSize: 28,
                  left: 10,
                  position: "relative",
                  color: "#ec4b00ff",
                  
                  fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif", // <-- add this line
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                }}>
              Auto Weed Annotator
            </h1>
          </div>
          
          <Settings onChange={setSelectedOps} />
          <div className="mt-3 mb-3">
            <h2 className="text-[#1976d2] font-bold text-lg mb-2">Instructions</h2>
            <ul className="leading-relaxed text-base text-[#FFFFFF] mb-2 pl-5 list-disc">
              <li>
                Use <span className="text-green-700 font-semibold">Mouse</span> To Draw
              </li>
              <li>
                Hold <span className="font-bold text-[#1976d2]">&quot;Space&quot;</span> and drag to change position
              </li>
              <li>Pinch to zoom</li> 
              <li>On canvas, press "s" to zoom / drag all layers together. </li> 
            </ul>
          </div>
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 bg-[#1976d2] text-white rounded-lg cursor-pointer mt-2 font-semibold text-base shadow-md border-2 border-[#1976d2]"
          >
            Upload Image
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          {imageUrl && (
            <div className="mt-3 text-green-200  text-base text-center ">
              Image uploaded!
            </div>
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75} className="h-full min-w-0 bg-[#f0f4ff] flex flex-col">
       
            <ResizablePanel defaultSize={80} className="flex-1 flex items-center justify-center min-h-0 min-w-0">
              <Wrap />
            </ResizablePanel>

        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );


}