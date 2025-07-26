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
    // handle response (e.g., show filename or success message)
  };

// return (
//   <div style={{
//     position: "fixed",
//     top: 0,
//     left: 0,
//     width: "100vw",
//     height: "100vh",
//     margin: 0,
//     padding: 0,
//     background: "linear-gradient(135deg, #0f2236ff 0%, #fff8f0 100%)",
//     borderRadius: 0,
//     boxShadow: "none",
//     fontFamily: "Inter, Arial, sans-serif",
//     minHeight: "100vh",
//     zIndex: 9999,
//     display: "flex",
//     flexDirection: "row"
//   }}>
//     {/* Settings/Instructions Column */}
//     <div style={{
//       width: folded ? 12 : 230,
//       height: "100vh", 
//       // minWidth: folded ? 12 : 280,
//       maxWidth: folded ? 32 : 400,
//       background: "#fff",
//       borderRight: "2px solid #bcd",
//       boxShadow: "2px 0 8px rgba(25,118,210,0.04)",
//       padding: folded ? "0" : "32px 24px 32px 32px",
//       display: "flex",
//       flexDirection: "column",
//       alignItems: folded ? "center" : "flex-start",
//       justifyContent: "flex-start",
//       position: "relative",
//       transition: "width 0.3s, min-width 0.3s, max-width 0.3s, padding 0.3s"
//     }}>
//       {/* if not folded, show */}
//       {!folded && (
//         <>
//           <h1 style={{ color: "#1976d2", fontWeight: 800, fontSize: 28, letterSpacing: 1, marginBottom: 18 }}>Auto Weed Annotator</h1>
//           <Settings onChange={setSelectedOps} />

//           <div style={{ marginTop: 12, marginBottom: 12 }}>
//             <h2 style={{ color: "#1976d2", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Instructions</h2>
//             <ul style={{ lineHeight: 1.6, fontSize: 15, color: "#333", marginBottom: 8, paddingLeft: 18 }}>
//               <li>Use <span style={{ color: "#43a047", fontWeight: 600 }}>Mouse</span> To Draw</li>
//               <li>Hold <span style={{ fontWeight: 700, color: "#1976d2" }}>&quot;Space&quot;</span> and drag to change position</li>
//               <li>Pinch to zoom</li>
//             </ul>
//           </div>
//           <label
//             htmlFor="file-upload"
//             style={{
//               display: "inline-block",
//               padding: "10px 24px",
//               background: "#1976d2",
//               color: "white",
//               borderRadius: "8px",
//               cursor: "pointer",
//               marginTop: "8px",
//               fontWeight: 600,
//               fontSize: 16,
//               boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
//               border: "2px solid #1976d2"
//             }}
//           >
//             Upload Image
//           </label>
//           <input
//             id="file-upload"
//             type="file"
//             style={{ display: "none" }}
//             onChange={handleUpload}
//           />
//           {imageUrl && (
//             <div style={{ marginTop: "12px", color: "#43a047", fontWeight: 700, fontSize: 16, textAlign: "center", border: "1px solid #43a047", borderRadius: 8, padding: "8px 0", background: "#e8f5e9" }}>
//               Image uploaded!
//             </div>
//           )}
//         </>
//       )}
//       {/* Fold handle */}
//       <div
//         onClick={() => setFolded((f) => !f)}
//         style={{
//           position: "absolute",
//           top: 0,
//           right: -12,
//           width: 24,
//           height: "100%",
//           background: "#bcd",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           zIndex: 1001,


//           boxShadow: "2px 0 8px rgba(25,118,210,0.08)"
//         }}
//       >
//         <span style={{ fontSize: 20, color: "#1976d2" , position: "absolute", top: 10}}>{folded ? "▶" : "◀"}</span>
//       </div>
//     </div>

//     <div style={{
//       // borderColor: "red", 
//       flex: 1,
//       // top: 0,
//       // width: 800, 
//       // position: "absolute", 
      
//       minWidth: 0,
//       background: "#f0f4ff",
//       padding: 0,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",

//     }}>
//       <Wrap />
//     </div>
//   </div>
// );



  return (
    <div className="fixed inset-0 w-screen h-screen min-w-0 min-h-0 bg-gradient-to-br from-[#0f2236] to-[#fff8f0] font-sans">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full max-w-full max-h-full rounded-none border-none"
      >
        <ResizablePanel defaultSize={12} className="h-full min-w-[0px] max-w-[600px] bg-[#222222] border-r-2 border-blue-100 shadow-md flex flex-col p-8">
          <h1 className="text-[#1976d2] font-extrabold text-2xl mb-4 tracking-wide">Auto Weed Annotator</h1>
          <Settings onChange={setSelectedOps} />
          <div className="mt-3 mb-3">
            <h2 className="text-[#1976d2] font-bold text-lg mb-2">Instructions</h2>
            <ul className="leading-relaxed text-base text-[#333] mb-2 pl-5 list-disc">
              <li>
                Use <span className="text-green-700 font-semibold">Mouse</span> To Draw
              </li>
              <li>
                Hold <span className="font-bold text-[#1976d2]">&quot;Space&quot;</span> and drag to change position
              </li>
              <li>Pinch to zoom</li>
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
            <div className="mt-3 text-green-700 font-bold text-base text-center border border-green-700 rounded-lg py-2 bg-green-50">
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