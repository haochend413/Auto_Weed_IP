"use client";
import React, {useRef} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useCanvasStore from "../../_store/canvas";
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
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
  const stageRef = useRef<Konva.Stage | null>(null); 
  
  return (
    <div className="App" style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      borderRadius: 16,
      boxShadow: "0 2px 16px rgba(25,118,210,0.10)",
      overflow: "hidden",
      background: "linear-gradient(90deg, #e3f0ff 0%, #fff8f0 100%)"
    }}>
      <div className="left-panel" style={{
        minWidth: 0,
        position: "relative",
        padding: "32px 18px 32px 32px",
        background: "#f0f4ff",
        borderRight: "2px solid #bcd",
        boxShadow: "2px 0 8px rgba(25,118,210,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start"
      }}>
        <h3 style={{ color: "#1976d2", fontWeight: 700, fontSize: 22, marginBottom: 18 }}>Regions</h3>
        <RegionsList />
      </div>
      <div className="right-panel" style={{
        minWidth: 0,
        width: width,
        position: "relative",
        background: "#fff8f0",
        borderLeft: "2px solid #edc",
        boxShadow: "-2px 0 8px rgba(67,160,71,0.04)",
        padding: "32px 32px 32px 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Canvas stageRef={stageRef} />
        <button
          style={{
            position: "absolute",
            bottom: 32,
            left: 32,
            zIndex: 1000,
            background: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 32px",
            fontWeight: 600,
            fontSize: 18,
            boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onClick={() => {
            handleDownload(stageRef.current);
          }}
        >
          Download Edited Image
        </button>
      </div>
    </div>
  );
};

export default Wrap; 