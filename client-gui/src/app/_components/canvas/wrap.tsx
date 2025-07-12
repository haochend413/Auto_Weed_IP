"use client";
import React, {useRef} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useStore from "../../_store/canvas";
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
  const width = useStore((s) => s.width);
  const stageRef = useRef<Konva.Stage | null>(null); 
  
  return (
    <div className="App" style={{ display: 'flex', height: '100%', width: '100%'}}>
      <div className="left-panel" style={{ minWidth: 0, position: "relative"}}> 
        <RegionsList />
      </div>
      <div className="right-panel" style={{ minWidth: 0, width:width, position: "relative" }}>
        <Canvas stageRef={stageRef} />
      <button
        style={{
          position: "absolute", 
          bottom: -30,
          left: 10,
          zIndex: 1000,
          background: "white"
        }}
        onClick={() => {
          // console.log("Button clicked");
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