"use client";
import React, {useRef, useState} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useCanvasStore from "../../_store/canvas";
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
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
  const[focusName, setFocusName] = useState<string>('region')
  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const regionLayerRef = useRef<Konva.Layer | null>(null); 
  const [focusLayer, setFocusLayer] = useState<Konva.Layer | null>(null)
    //helpers
    const switchFocus = (name: string) => {
   
      setFocusName(name); // Update the focusName state
      console.log("Switching focus to:", name);
      
      switch (name) {
        case 'region':
          if (!regionLayerRef.current) {
            return;
          } 
          regionLayerRef.current.listening(true);
          if (imageLayerRef.current) {
            imageLayerRef.current.listening(false);
          }
          setFocusLayer(regionLayerRef.current);
          break;
        case 'base image':
          if (!imageLayerRef.current) {
            return;
          } 
          imageLayerRef.current.listening(true);
          if (regionLayerRef.current) {
            regionLayerRef.current.listening(false);
          }
          setFocusLayer(imageLayerRef.current);
          break;
      }
    }
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

      <div style={{ display: "flex", width: "100%", height: "100vh" }}>
  <div className="left-panel" style={{
    width: 300, // or your desired fixed width
    minWidth: 0,
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
    flex: 1, 
    minWidth: 0,
    width: 2000,
    background: "#fff8f0",
    borderLeft: "2px solid #edc",
    boxShadow: "-2px 0 8px rgba(67,160,71,0.04)",
    padding: "32px 32px 32px 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" // for absolute button
  }}>
          <div style={{ 
        position: "absolute", 
        top: 10, 
        left: 10,  
        zIndex: 1000,
        width: "200px",
        background: "rgba(0,0,0,0.7)",
        padding: "8px",
        borderRadius: "5px"
      }}>
        <div style={{ marginBottom: "8px", color: "white", fontSize: "14px", fontWeight: "bold" }}>
          Active Layer
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
              transition: 'background 0.2s'
            }}
            onClick={() => {
              // const fakeEvent = { target: { value: 'region' } } as SelectChangeEvent;
              switchFocus('region');
            }}
          >
            Region Layer
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
              transition: 'background 0.2s'
            }}
            onClick={() => {
              // const fakeEvent = { target: { value: 'base image' } } as SelectChangeEvent;
              switchFocus('base image');
              console.log(focusLayer)
            }} 
          >
            Base Image
          </button>
        </div>
      </div>

    <Canvas stageRef={stageRef} focusLayer={focusLayer} setFocusLayer={setFocusLayer} imageLayerRef={imageLayerRef} regionLayerRef={regionLayerRef} focusName={focusName} setFocusName={setFocusName}/>
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
      {/* Layer Selection Bar */}

    </div>
  );
};

export default Wrap; 