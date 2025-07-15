import React, { useEffect, useRef } from "react";
import Konva from "konva";

import useCanvasStore from "../../_store/canvas";

export default function Regions() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const selectedId = useCanvasStore(s => s.selectedRigionId);
  const selectRegion = useCanvasStore(s => s.selectRegion);
  const regions = useCanvasStore(s => s.regions);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!layerRef.current) {
      layerRef.current = new Konva.Layer();
    }

    const layer = layerRef.current; 

    // Clear previous shapes
    layer.destroyChildren();

    // For each region, draw the "erase" and then the fill lines
    // This is how the stored regions gets rendered; 
    regions.forEach(region => {
      const points = region.points.flatMap(p => [p.x, p.y]);

      // "Erase" previous drawing with destination-out  
      const eraseLine = new Konva.Line({
        points,
        fill: "black", 
        closed: true,
        listening: false,
        globalCompositeOperation: "destination-out",
      });
      layer.add(eraseLine);

      // Draw the region fill
      const fillLine = new Konva.Line({
        points,
        fill: region.color,
        closed: true,
        opacity: region.id === selectedId ? 1 : 0.8,
        name: "region",
      });

      fillLine.on("click", () => {
        selectRegion(region.id);
      });

      layer.add(fillLine);
    });

    layer.draw();

    // Attach the layer to stage/container once if not already attached
    if (!layer.getStage()) {
      // Create a Konva.Stage if not already created and attach the layer
      if (!containerRef.current) return;
      // Store the stage instance on the container DOM node for reuse
      let stage = (containerRef.current as any)._konvaStage as Konva.Stage | undefined;
      if (!stage) {
        stage = new Konva.Stage({
          container: containerRef.current,
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
        (containerRef.current as any)._konvaStage = stage;
      }
      stage.add(layer);
    }
  }, [regions, selectedId, selectRegion]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
