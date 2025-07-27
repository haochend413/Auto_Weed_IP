"use client";
import React, {useRef, useState} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useCanvasStore from "../../_store/canvas";
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
import BorderList from "./BordersList";
import { Download } from "./Download";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { setFitCanvas } from "./utils";

// import useStore from "../../store";

const handleDownload = (stage: Konva.Stage | null) => { 
  // console.log("Clicked");
  if (stage) {
      console.log("Clicked");
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = dataURL;
    link.click(); 
  }
}; 


 
const Wrap =  () => {
  const width = useCanvasStore((s) => s.width);
  const height = useCanvasStore((s) => s.height);
  const stageRef = useRef<Konva.Stage | null>(null); 
  const[focusName, setFocusName] = useState<string>('region')
  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const regionLayerRef = useRef<Konva.Layer | null>(null); 
  const borderLayerRef = useRef<Konva.Layer | null>(null); 
   const origScale = useCanvasStore((s) => s.origScale); 
  const [focusLayer, setFocusLayer] = useState<Konva.Layer | null>(null)
  const layerRefs: Record<string, React.RefObject<Konva.Layer | null>> = {
    "region": regionLayerRef,
    "base image": imageLayerRef,
    "border": borderLayerRef,
  };
  
  const switchFocus = (name: string) => {
    setFocusName(name);
    Object.entries(layerRefs).forEach(([key, ref]) => {
      ref.current?.listening(key === name);
    });
    setFocusLayer(layerRefs[name]?.current ?? null);
  };




  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full" >
      {/* Top: Canvas only */}
      <ResizablePanel defaultSize={80} minSize={20} className="flex flex-col items-center justify-center bg-[#222222] overflow-hidden">
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Canvas
            stageRef={stageRef}
            focusLayer={focusLayer}
            setFocusLayer={setFocusLayer}
            imageLayerRef={imageLayerRef}
            regionLayerRef={regionLayerRef}
            focusName={focusName}
            setFocusName={setFocusName}
            borderLayerRef={borderLayerRef}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle className="custom-resize-handle"
      />
      {/* Bottom: Sidebar | Button | Layers */}
      <ResizablePanel defaultSize={20} minSize={10} className="flex flex-row !overflow-visible !p-0 bg-[#222222]">
        {/* Sidebar section */}
        <div
          style={{
            width: 320,
            background: "#212121ff",
            boxShadow: "2px 0 8px rgba(25,118,210,0.04)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "25px",
            overflow: "auto",
          }}
        >
          <div style={{ position: "relative", height: 200 }}>
            <h3 style={{ color: "#1976d2", fontWeight: 500, fontSize: 15, marginBottom: 8 }}>Regions</h3>
            <RegionsList />
            <h3 style={{ color: "#1976d2", fontWeight: 500, fontSize: 15, marginBottom: 8 }}>Borders</h3>
            <BorderList />
          </div>
        </div>

        {/* Button section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 32px",
            flexDirection: "column", 
          }}
        >
          <Button
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 32px",
              fontWeight: 600,
              fontSize: 18,
              boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
              cursor: "pointer",
              transition: "background 0.2s",
              marginBottom: 10, 
            }}
            onClick={() => handleDownload(stageRef.current)}
          >
            Download Edited Image
          </Button>

          <Download/>

        </div>
  

        {/* Layers section */}
        <div
          style={{
            width: 240,
            background: "rgba(0,0,0,0.7)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: "8px", color: "white", fontSize: "14px", fontWeight: "bold" }}>
            Focused Layer
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            <Button
              style={{
                background: focusName === "region" ? "#1976d2" : "rgba(255,255,255,0.15)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: focusName === "region" ? "bold" : "normal",
                transition: "background 0.2s",
                width: "100%",
              }}
              onClick={() => switchFocus("region")}
            >
              Segmentations
            </Button>
            <Button
              style={{
                background: focusName === "base image" ? "#1976d2" : "rgba(255,255,255,0.15)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: focusName === "base image" ? "bold" : "normal",
                transition: "background 0.2s",
                width: "100%",
              }}
              onClick={() => switchFocus("base image")}
            >
              Base Image
            </Button>
            <Button
              style={{
                background: focusName === "border" ? "#1976d2" : "rgba(255,255,255,0.15)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 12px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: focusName === "border" ? "bold" : "normal",
                transition: "background 0.2s",
                width: "100%",
              }}
              onClick={() => switchFocus("border")}
            >
              Detections
            </Button>
          </div>
          <div>
            <Button onClick={() => setFitCanvas(
              stageRef.current,
              [imageLayerRef.current, regionLayerRef.current, borderLayerRef.current],
              imageLayerRef.current,
              origScale,
            )}> 
              Fit Canvas
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default Wrap; 