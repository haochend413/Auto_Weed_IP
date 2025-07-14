"use client";
// Example: /client-gui/src/app/page.tsx
import React, { useState, useEffect} from "react";
import Settings from "./_components/settings";
import Wrap from "./_components/canvas/wrap";
import  useImageStore  from "./_store/img";
import useServerStore from "./_store/server";

export default function Home() {
  const imageUrl = useImageStore((s) => s.imageUrl)
  const setImageUrl = useImageStore((s) => s.setImageUrl)
  const [folded, setFolded] = useState(false);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  const setBaseServerURL = useServerStore((s) => s.setBaseServerURL) 
  useEffect(() => {
    // Try possible backend URLs at startup
    const urls = [
      "http://192.168.10.252:8000", // try LAN first
      "http://localhost:8000",
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

return (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    margin: 0,
    padding: 0,
    background: "linear-gradient(135deg, #e3f0ff 0%, #fff8f0 100%)",
    borderRadius: 0,
    boxShadow: "none",
    fontFamily: "Inter, Arial, sans-serif",
    minHeight: "100vh",
    zIndex: 9999,
    display: "flex",
    flexDirection: "row"
  }}>
    {/* Settings/Instructions Column */}
    <div style={{
      width: folded ? 32 : 340,
      minWidth: folded ? 32 : 280,
      maxWidth: folded ? 32 : 400,
      background: "#fff",
      borderRight: "2px solid #bcd",
      boxShadow: "2px 0 8px rgba(25,118,210,0.04)",
      padding: folded ? "0" : "32px 24px 32px 32px",
      display: "flex",
      flexDirection: "column",
      alignItems: folded ? "center" : "flex-start",
      justifyContent: "flex-start",
      position: "relative",
      transition: "width 0.3s, min-width 0.3s, max-width 0.3s, padding 0.3s"
    }}>
      {/* if not folded, show */}
      {!folded && (
        <>
          <h1 style={{ color: "#1976d2", fontWeight: 800, fontSize: 28, letterSpacing: 1, marginBottom: 18 }}>Auto Weed Annotator</h1>
          <Settings onChange={setSelectedOps} />

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <h2 style={{ color: "#1976d2", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Instructions</h2>
            <ul style={{ lineHeight: 1.6, fontSize: 15, color: "#333", marginBottom: 8, paddingLeft: 18 }}>
              <li>Use <span style={{ color: "#43a047", fontWeight: 600 }}>Mouse</span> To Draw</li>
              <li>Hold <span style={{ fontWeight: 700, color: "#1976d2" }}>&quot;Space&quot;</span> and drag to change position</li>
              <li>Pinch to zoom</li>
            </ul>
          </div>
          <label
            htmlFor="file-upload"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "#1976d2",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "8px",
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
              border: "2px solid #1976d2"
            }}
          >
            Upload Image
          </label>
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          {imageUrl && (
            <div style={{ marginTop: "12px", color: "#43a047", fontWeight: 700, fontSize: 16, textAlign: "center", border: "1px solid #43a047", borderRadius: 8, padding: "8px 0", background: "#e8f5e9" }}>
              Image uploaded!
            </div>
          )}
        </>
      )}
      {/* Fold handle */}
      <div
        onClick={() => setFolded((f) => !f)}
        style={{
          position: "absolute",
          top: 0,
          right: -12,
          width: 24,
          height: "100%",
          background: "#bcd",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          boxShadow: "2px 0 8px rgba(25,118,210,0.08)"
        }}
      >
        <span style={{ fontSize: 20, color: "#1976d2" }}>{folded ? "▶" : "◀"}</span>
      </div>
    </div>
    {/* Canvas Column */}
    <div style={{
      flex: 1,
      minWidth: 0,
      background: "#f0f4ff",
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Wrap />
    </div>
  </div>
);
}