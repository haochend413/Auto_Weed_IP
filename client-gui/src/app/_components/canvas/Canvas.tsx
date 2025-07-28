"use client";
import React, { useState, useEffect, useRef } from "react";
import Konva from "konva";
import useCanvasStore from "../../_store/canvas";
import BaseImage from "./BaseImage";
import { getRelativePointerPosition, zoomLayer, zoomStage } from './utils';
import { isHotkeyPressed, useHotkeys } from 'react-hotkeys-hook'; 

let id = 1;

interface CanvasProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
  imageLayerRef: React.RefObject<Konva.Layer | null>;
  regionLayerRef: React.RefObject<Konva.Layer | null>;
  borderLayerRef: React.RefObject<Konva.Layer | null>;
  focusName: string;
  setFocusName: (name: string) => void; 
  focusLayer: Konva.Layer | null; 
  setFocusLayer: (layer: Konva.Layer) => void 
}

const Canvas = ({ stageRef, imageLayerRef, regionLayerRef, borderLayerRef, focusName, setFocusName, focusLayer, setFocusLayer}: CanvasProps) => {
  //used for rendering the Konva elements
  const containerRef = useRef<HTMLDivElement>(null);
  // Add state to store and display stage position (tmp)


  const width = useCanvasStore((s) => s.width);
  const height = useCanvasStore((s) => s.height);
  const setSize = useCanvasStore((s) => s.setSize); 
  const isDrawing = useCanvasStore((s) => s.isDrawing);
  const toggleDrawing = useCanvasStore((s) => s.toggleIsDrawing);

  const regions = useCanvasStore((s) => s.regions);
  const setRegions = useCanvasStore((s) => s.setRegions);
  const selectRegion = useCanvasStore((s) => s.selectRegion);

  const borders = useCanvasStore((s) => s.borders);
  const setBorders = useCanvasStore((s) => s.setBorders);

  const regionsRef = useRef(regions); 
  const isDrawingRef = useRef(isDrawing);
  const borderRef = useRef(borders); 
  


  //action modes 
  const [opsMode, setOpsMode] = useState<string>("draw"); 

  const opsModeRef = useRef(opsMode);

  useEffect(() => {
  opsModeRef.current = opsMode;
}, [opsMode]);

  

  // update for other component's update on regions; 
  useEffect(() => { regionsRef.current = regions; }, [regions]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { borderRef.current = borders; }, [borders]);


      //setup keybindings; 
   
  useHotkeys("a", () => {
    console.log(opsMode)
  }) 


  // Initialize stage and layers only once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setOpsMode("draw"); 
    // create stage ad layers
    const stage = new Konva.Stage({
      container,
      width,
      height,
    }); 

    // stageRef set; 
    if (stageRef) {
      stageRef.current = stage;
    }
     //initialize layers; 
    const imageLayer = new Konva.Layer();
    imageLayerRef.current = imageLayer;
    const regionLayer = new Konva.Layer(
      {
        width: width,
        height: height, 
      }
    );
    regionLayerRef.current = regionLayer;
    const borderLayer = new Konva.Layer(
      {
        width: width,
        height: height, 
      }
    );
    borderLayerRef.current = borderLayer;
    const background1 = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'transparent',
      listening: true,
    });
    regionLayer.add(background1); 
    const background2 = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: 'transparent',
      listening: true,
    });
    borderLayer.add(background2);

    stage.add(imageLayer);
    stage.add(regionLayer);
    stage.add(borderLayer); 

    const layerMap: Record<string, Konva.Layer> = {
      "region": regionLayer,
      "base image": imageLayer,
      "border": borderLayer,
    };

    Object.entries(layerMap).forEach(([key, layer]) => {
      layer.listening(key === focusName);
    });
    setFocusLayer(layerMap[focusName]);

  


    regionLayer.on("click", (e) => {
      if (e.target.name() !== "region") {
        selectRegion(null);
      }
    });


    regionLayer.on("mousedown", () => { 
      if (opsModeRef.current === "draw") {
        toggleDrawing();
        const point = getRelativePointerPosition(stage, regionLayer);
        const region = {
          id: id++,
          color: "red", 
          points: [point],
        };
        setRegions([...regionsRef.current, region]);
      }
    });

    regionLayer.on("mousemove", () => {
      if (opsModeRef.current === "draw") {
        if (!isDrawingRef.current) return;
        const point = getRelativePointerPosition(stage, regionLayer);
        const scaledPoint = { x: point.x , y: point.y };
        const prevRegions = regionsRef.current;
        if (!prevRegions.length) return;
        const lastRegion = { ...prevRegions[prevRegions.length - 1] };
        lastRegion.points = [...lastRegion.points, scaledPoint];
        const newRegions = [...prevRegions.slice(0, -1), lastRegion];
        setRegions(newRegions);
      }
    });

    regionLayer.on("mouseup", () => {
      if (opsModeRef.current === "draw") {
        if (!isDrawingRef.current) return;
        const prevRegions = regionsRef.current;
        if (!prevRegions.length) return;
        const lastRegion = prevRegions[prevRegions.length - 1];
        if (lastRegion.points.length < 3) {
          setRegions(prevRegions.slice(0, -1));
        }
        toggleDrawing();
      }
    });

    // --- Border Layer ---

    borderLayer.on("mousedown", () => { 
      // if (opsMode !== "draw") return;
      if (opsModeRef.current === "draw") {
        toggleDrawing();
        const point = getRelativePointerPosition(stage, borderLayer);
        const border = {
          id: id++,
          color: "blue", 
          x: point.x,
          y: point.y,
          width: 0, 
          height: 0,  
        };
        setBorders([...borderRef.current, border]);
      }
    });

    borderLayer.on("mousemove", () => {
      // if (opsMode !== "draw") return;
      if (opsModeRef.current === "draw") {
        if (!isDrawingRef.current) return;
        const point = getRelativePointerPosition(stage, borderLayer);
        const prevBorders = borderRef.current;
        if (!prevBorders.length) return;
        const lastBorder = { ...prevBorders[prevBorders.length - 1] };
        lastBorder.width = point.x - lastBorder.x
        lastBorder.height = point.y - lastBorder.y
        const newBorders = [...prevBorders.slice(0, -1), lastBorder];
        setBorders(newBorders)
      }
    });

    borderLayer.on("mouseup", () => {
      // if (opsMode !== "draw") return;
      if (opsModeRef.current === "draw") {
        if (!isDrawingRef.current) return;
        const prevBorders = borderRef.current;
        if (!prevBorders.length) return;
        toggleDrawing();
      }
    });
  



    // Resize handling
    const resize = () => {
      const container = document.querySelector(".right-panel") as HTMLElement | null;
      if (container) {
        setSize({ width: container.offsetWidth, height });
        stage.size({ width: container.offsetWidth, height });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      stage.destroy();
    };
  }, []); // Run once on mount 


  //set kepbindings; 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyS") setOpsMode("Stage");
      if (e.code === "Space") setOpsMode("View"); 

    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyS" || "Space") setOpsMode("draw");
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    console.log(opsMode);
  }, [opsMode]);



  // Use opsMode to control draggability
  useEffect(() => {
    if (opsMode === "Stage" && stageRef?.current) {
      stageRef.current.draggable(true);
    } else if (opsMode === "View" && focusLayer) {
      focusLayer.draggable(true);
    } else {
      if (stageRef?.current) stageRef.current.draggable(false);
      if (focusLayer) focusLayer.draggable(false);
    }
  }, [opsMode, stageRef, focusLayer]);


// Use opsMode to control wheel zoom
useEffect(() => {
  function handleWheel(e: any) {
    e.evt.preventDefault();
    const scaleBy = e.evt.deltaY > 0 ? 0.9 : 1.1;
    if (opsMode === "Stage" && stageRef?.current) {
      zoomStage(stageRef.current, scaleBy);
    } else if (focusLayer) {
      zoomLayer(focusLayer, scaleBy);
    }
  }

  // Attach to both, but only one will act depending on opsMode
  if (stageRef?.current) {
    stageRef.current.on("wheel", handleWheel);
  }
  if (focusLayer) {
    focusLayer.on("wheel", handleWheel);
  }

  return () => {
    if (stageRef?.current) {
      stageRef.current.off("wheel", handleWheel);
    }
    if (focusLayer) {
      focusLayer.off("wheel", handleWheel);
    }
  };
}, [stageRef, focusLayer, opsMode]);




  // Redraw regions whenever `regions` changes
  useEffect(() => {
    const regionLayer = regionLayerRef.current;
    if (!regionLayer) return;

    // Clear old regions
    regionLayer.find(".region").forEach((node) => node.destroy());

    regions.forEach((region) => { 
      // console.log(region)
      const line = new Konva.Line({
        points: region.points.flatMap((p) => [p.x , p.y ]),
        stroke: region.color,
        strokeWidth: 0.5,
        closed: true,
        fill: "#ff20205e",
        name: "region",
      });
      regionLayer.add(line);
    });

    regionLayer.batchDraw();
  }, [regions]);


    // Redraw borders whenever `borders` changes
  useEffect(() => {
    const borderLayer = borderLayerRef.current;
    if (!borderLayer) return;

    // Clear old regions
    borderLayer.find(".border").forEach((node) => node.destroy());
    if (borders) {
      borders.forEach((border) => { 
        // console.log(border);
        const rect = new Konva.Rect({
          // points: region.points.flatMap((p) => [p.x, p.y]),
          stroke: border.color,
          strokeWidth: 2,
          // closed: true,
          // fill: border.color + "33",
          x: border.x ,
          y: border.y , 
          width: border.width , 
          height: border.height , 
          name: "border",
        });
        borderLayer.add(rect);
      });
    }

    borderLayer.batchDraw();
  }, [borders]);

  return ( 
    <div style={{ position: "relative" }}>
      {/* Stage position display */}
      <div
        ref={containerRef}
        style={{
          // bottom: 400,
          border: "1px solid #cdcdcdff", 
          width: width,
          height: height, 
          position: "relative" 
        }}
      > 
        {imageLayerRef.current && <BaseImage layer={imageLayerRef.current} />}
      </div>
    </div>
  );
};

export default Canvas
