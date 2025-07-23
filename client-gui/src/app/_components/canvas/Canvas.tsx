"use client";
import React, { useState, useEffect, useRef } from "react";
import Konva from "konva";
import useCanvasStore from "../../_store/canvas";
import BaseImage from "./BaseImage";
import { getRelativePointerPosition, zoomLayer, zoomStage } from './utils';

let id = 1;

//This SCALE is for sizes change between image-canvas, has nothing to do with cv2 ! 
const SCALE = 0.175; 

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
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0, scale: 1 });
  const [imagelyerpos, setimgpos] = useState({ x: 0, y: 0, scale: 1 });
  const [regionslyerpos, setregpos] = useState({ x: 0, y: 0, scale: 1 });
  //we use this to manage the focused layer; 
  


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


    //actions: drag
    let spacePressed = false;


  

  // update for other component's update on regions; 
  useEffect(() => { regionsRef.current = regions; }, [regions]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);
  useEffect(() => { borderRef.current = borders; }, [borders]);



  // Initialize stage and layers only once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: 'transparent',
      listening: true
    });
    regionLayer.add(background);

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


    //modify this to be drawing on layer; 


    regionLayer.on("mousedown", () => { 
      if (!spacePressed) {
        toggleDrawing();
        const point = getRelativePointerPosition(stage, regionLayer);
        // Multiply x and y by SCALE
        const scaledPoint = { x: point.x, y: point.y  };
        const region = {
          id: id++,
          color: Konva.Util.getRandomColor(),
          points: [scaledPoint],
        };
        setRegions([...regionsRef.current, region]);
      }
    });

    regionLayer.on("mousemove", () => {
      if (!spacePressed) {
        if (!isDrawingRef.current) return;
        const point = getRelativePointerPosition(stage, regionLayer);
        // Multiply x and y by SCALE
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
            if (!spacePressed) {
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

  //actions that depends on focusLayer; 
  useEffect(() => {
    if (focusLayer) {
          focusLayer.on("wheel", (e) => {
      e.evt.preventDefault();
      const scaleBy = e.evt.deltaY > 0 ? 0.9 : 1.1;
      zoomLayer(focusLayer, scaleBy);

    });
    }

        // let shiftPressed = false; 
      window.addEventListener("keydown", (e) => {
        if (e.code === "Space") { 
          spacePressed = true;
          if (focusLayer) {
            focusLayer.draggable(true)
          }
          console.log(focusLayer)
        } 
      });

      window.addEventListener("keyup", (e) => {
        if (e.code === "Space") {
          spacePressed = false; 
          focusLayer?.draggable(false)
        }
      });
  }, [focusLayer])

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
        fill: region.color + "33",
        name: "region",
      });
      regionLayer.add(line);
    });

    regionLayer.batchDraw();
  }, [regions]);


    // Redraw regions whenever `regions` changes
  useEffect(() => {
    const borderLayer = borderLayerRef.current;
    if (!borderLayer) return;

    // Clear old regions
    borderLayer.find(".border").forEach((node) => node.destroy());

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

    borderLayer.batchDraw();
  }, [borders]);






  return ( 
    <div style={{ position: "relative" }}>
      {/* Stage position display */}
      <div
        ref={containerRef}
        style={{
          border: "1px solid black", 
          width: "100%",
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
