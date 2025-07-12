"use client";
import React, { useEffect, useRef } from "react";
import Konva from "konva";
import useStore from "../../store";
import BaseImage from "./BaseImage";

let id = 1;

//draw with pointer
function getRelativePointerPosition(node: Konva.Stage) {
  const transform = node.getAbsoluteTransform().copy();
  transform.invert();
  const pos = node.getPointerPosition();
  return pos ? transform.point(pos) : { x: 0, y: 0 };
}

//on pinch zoom function
function zoomStage(stage: Konva.Stage, scaleBy: number) {
  const oldScale = stage.scaleX();
  const mousePointTo = {
    x: stage.width() / 2 / oldScale - stage.x() / oldScale,
    y: stage.height() / 2 / oldScale - stage.y() / oldScale,
  };
  const newScale = Math.max(0.05, oldScale * scaleBy);
  const newPos = {
    x: -(mousePointTo.x - stage.width() / 2 / newScale) * newScale,
    y: -(mousePointTo.y - stage.height() / 2 / newScale) * newScale,
  };
  stage.scale({ x: newScale, y: newScale });
  stage.position(newPos);
  stage.batchDraw();
}

interface CanvasProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
}

const Canvas = ({ stageRef }: CanvasProps) => {
  //used for rendering the Konva elements
  const containerRef = useRef<HTMLDivElement>(null);

  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const regionLayerRef = useRef<Konva.Layer | null>(null);

  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const setSize = useStore((s) => s.setSize); 
  const isDrawing = useStore((s) => s.isDrawing);
  const toggleDrawing = useStore((s) => s.toggleIsDrawing);
  const regions = useStore((s) => s.regions);
  const setRegions = useStore((s) => s.setRegions);
  const selectRegion = useStore((s) => s.selectRegion);

  // --- Fix: keep refs to always-latest state for event handlers ---
  const regionsRef = useRef(regions); 
  const isDrawingRef = useRef(isDrawing);
  useEffect(() => { regionsRef.current = regions; }, [regions]);
  useEffect(() => { isDrawingRef.current = isDrawing; }, [isDrawing]);


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
    // localStageRef.current = stage;
    if (stageRef) {
      stageRef.current = stage;
    }

    let spacePressed = false;

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        spacePressed = true;
        stage.draggable(true);
        stage.container().style.cursor = "grab";
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        spacePressed = false;
        stage.draggable(false);
        stage.container().style.cursor = "default";
      }
    });

    const imageLayer = new Konva.Layer();
    imageLayerRef.current = imageLayer;
    const regionLayer = new Konva.Layer();
    regionLayerRef.current = regionLayer;

    stage.add(imageLayer);
    stage.add(regionLayer);

    //click and wheel
    stage.on("click", (e) => {
      if (e.target.name() !== "region") {
        selectRegion(null);
      }
    });

    stage.on("wheel", (e) => {
      e.evt.preventDefault();
      const scaleBy = e.evt.deltaY > 0 ? 0.9 : 1.1;
      zoomStage(stage, scaleBy);
    });


    stage.on("mousedown", () => {
      if (!spacePressed) {
              toggleDrawing();
      const point = getRelativePointerPosition(stage);
      const region = {
        id: id++,
        color: Konva.Util.getRandomColor(),
        points: [point],
      };
      setRegions([...regionsRef.current, region]);
      }

    });

    stage.on("mousemove", () => {
      if (!spacePressed) {
              if (!isDrawingRef.current) return;
      const point = getRelativePointerPosition(stage);
      const prevRegions = regionsRef.current;
      if (!prevRegions.length) return;
      const lastRegion = { ...prevRegions[prevRegions.length - 1] };
      lastRegion.points = [...lastRegion.points, point];
      const newRegions = [...prevRegions.slice(0, -1), lastRegion];
      setRegions(newRegions);
      }

    });

    stage.on("mouseup", () => {
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

  // Redraw regions whenever `regions` changes
  useEffect(() => {
    const regionLayer = regionLayerRef.current;
    if (!regionLayer) return;

    // Clear old regions
    regionLayer.find(".region").forEach((node) => node.destroy());

    regions.forEach((region) => {
      const line = new Konva.Line({
        points: region.points.flatMap((p) => [p.x, p.y]),
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

  return ( 
    <div style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{
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
