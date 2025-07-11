"use client";
import React, {useRef} from "react";
import dynamic from 'next/dynamic';
import useStore from "../../store";
import Konva from "konva";
import "./style.css";
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
  const stageRef = useRef<Konva.Stage | null>(null);
  const height = useStore((s) => s.height);
  return (
    <div className="App" style={{ display: 'flex', height: '100%', width: '100%'}}>
      <div className="left-panel" style={{ minWidth: 0, flex:1}}> 
        <RegionsList />
      </div>
<div className="right-panel" style={{ minWidth: 0, flex: 1, position: "relative" }}>
  <Canvas stageRef={stageRef} />
<button
  style={{
    position: "absolute",
    top: 10,
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