"use client";
import React, {useRef, useState} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useCanvasStore from "../../_store/canvas";
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
import BorderList from "./BordersList";

// import useStore from "../../store";


// src/app/_components/canvas/utils.ts
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
  <div
    className="App"
    style={{
      boxShadow: "0 2px 16px rgba(25,118,210,0.10)",
      overflow: "hidden",
      background: "linear-gradient(90deg, #0d3767ff 0%, #fff8f0 100%)",
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Top row: Canvas only */}
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#222222ff",
        overflow: "hidden",
      }}
    >
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
    </div>

    {/* Bottom row: sidebar, button, layers */}
    <div
      style={{
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        background: "rgba(40, 40, 40, 0.95)",
        boxShadow: "0 -2px 8px rgba(25,118,210,0.08)",
        minHeight: 120,
        overflow: "visible",
      }}
    >
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
          justifyContent: "center"
        }}
      >
        <button
          style={{
            background: "#1976d2",
            color: "white",
            border: "none",
            padding: "12px 32px",
            fontWeight: 600,
            fontSize: 18,
            boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onClick={() => handleDownload(stageRef.current)}
        >
          Download Edited Image
        </button>
      </div>

      {/* Layers section */}
      <div
        style={{
          width: 240,
          background: "rgba(0,0,0,0.7)",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div style={{ marginBottom: "8px", color: "white", fontSize: "14px", fontWeight: "bold" }}>
          Focused Layer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
          <button
            style={{
              background: focusName === 'region' ? '#1976d2' : 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: focusName === 'region' ? 'bold' : 'normal',
              transition: 'background 0.2s',
              width: '100%'
            }}
            onClick={() => switchFocus('region')}
          >
            Segmentations
          </button>
          <button
            style={{
              background: focusName === 'base image' ? '#1976d2' : 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: focusName === 'base image' ? 'bold' : 'normal',
              transition: 'background 0.2s',
              width: '100%'
            }}
            onClick={() => switchFocus('base image')}
          >
            Base Image
          </button>
          <button
            style={{
              background: focusName === 'border' ? '#1976d2' : 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: focusName === 'border' ? 'bold' : 'normal',
              transition: 'background 0.2s',
              width: '100%'
            }}
            onClick={() => switchFocus('border')}
          >
            Detections
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default Wrap; 