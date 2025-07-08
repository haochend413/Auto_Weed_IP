import React from 'react';
import Konva from 'konva';
import { Stage } from 'react-konva';

import Regions from './Regions';
import BaseImage from './BaseImage';

import useStore from '../../store';

let id = 1;
 // the function will return pointer position relative to the passed node
function getRelativePointerPosition(node: Konva.Node) {
  const transform = node.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();
  // get pointer (say mouse or touch) position 
  const stage = node.getStage();
  const pos = stage ? stage.getPointerPosition() : null;
  // now we find relative point
  return pos ? transform.point(pos) : { x: 0, y: 0 };
}

function zoomStage(stage: Konva.Stage, scaleBy: number) {
  const oldScale = stage.scaleX();

  const pos = {
    x: stage.width() / 2,
    y: stage.height() / 2,
  };
  const mousePointTo = {
    x: pos.x / oldScale - stage.x() / oldScale,
    y: pos.y / oldScale - stage.y() / oldScale,
  };

  const newScale = Math.max(0.05, oldScale * scaleBy);

  const newPos = {
    x: -(mousePointTo.x - pos.x / newScale) * newScale,
    y: -(mousePointTo.y - pos.y / newScale) * newScale,
  };

  const newAttrs = limitAttributes(stage, { ...newPos, scale: newScale });

  stage.to({
    x: newAttrs.x,
    y: newAttrs.y,
    scaleX: newAttrs.scale,
    scaleY: newAttrs.scale,
    duration: 0.1,
  });
}

function limitAttributes(stage: Konva.Stage, newAttrs: { x: number; y: number; scale: number }) {
  const imageNode = stage.findOne('Image');
  if (!imageNode) { 
    // fallback: don't limit if image not found
    return { x: newAttrs.x, y: newAttrs.y, scale: newAttrs.scale };
  }
  const box = imageNode.getClientRect();
  const minX = -box.width + stage.width() / 2;
  const maxX = stage.width() / 2;

  const x = Math.max(minX, Math.min(newAttrs.x, maxX));

  const minY = -box.height + stage.height() / 2;
  const maxY = stage.height() / 2;

  const y = Math.max(minY, Math.min(newAttrs.y, maxY));

  const scale = Math.max(0.05, newAttrs.scale);

  return { x, y, scale };
}

const Canvas = () => {
  const stageRef = React.useRef<Konva.Stage>(null);
    const width = useStore(s => s.width);
    const height = useStore(s => s.height);
  const setSize = useStore((s) => s.setSize);
  const scale = useStore((state) => state.scale);
  const isDrawing = useStore((state) => state.isDrawing);
  const toggleDrawing = useStore((state) => state.toggleIsDrawing);
  const regions = useStore((state) => state.regions);
  const setRegions = useStore((state) => state.setRegions);
  const selectRegion = useStore((s) => s.selectRegion);

  React.useEffect(() => {
    function checkSize() {
      const container = document.querySelector('.right-panel');
      if (container) { 
        const htmlContainer = container as HTMLElement;
        setSize({
          width: htmlContainer.offsetWidth,
          height,
        });
      }
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  return (
    <React.Fragment>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={scale}
        scaleY={scale}
        className="canvas"
        onClick={(e) => {
          const clickedNotOnRegion = e.target.name() !== 'region';
          if (clickedNotOnRegion) {
            selectRegion(null);
          }
        }}
        onWheel={(e) => {
          e.evt.preventDefault();
          const stage = stageRef.current;

          if (!stage) return;

          const dx = -e.evt.deltaX;
          const dy = -e.evt.deltaY;
          const pos = limitAttributes(stage, {
            x: stage.x() + dx,
            y: stage.y() + dy,
            scale: stage.scaleX(),
          });
          stage.position(pos);
        }}
        onMouseDown={(e) => {
            // ? 
          toggleDrawing();
          const stage = e.target.getStage();
          if (!stage) return;
          const point = getRelativePointerPosition(stage);
          const region = {
            id: id++,
            color: Konva.Util.getRandomColor(),
            points: [point],
          };
          setRegions(regions.concat([region]));
        }}
        onMouseMove={(e) => {
          if (!isDrawing) return;
          const lastRegion = { ...regions[regions.length - 1] };
          const stage = e.target.getStage();
          if (!stage) return;
          const point = getRelativePointerPosition(stage);
          lastRegion.points = lastRegion.points.concat([point]);
          regions.splice(regions.length - 1, 1);
          setRegions(regions.concat([lastRegion]));
        }}
        onMouseUp={(e) => {
          if (!isDrawing) {
            return;
          }
          const lastRegion = regions[regions.length - 1];
          if (lastRegion.points.length < 3) {
            regions.splice(regions.length - 1, 1);
            setRegions(regions.concat());
          }
          toggleDrawing();
        }}
      >
        <BaseImage />
        <Regions />
      </Stage>
        <div
        className="zoom-container"
        style={{
            // position: "absolute",
            // top: 24,
            // left: 24,
            // position:"absolute",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: 8,
            zIndex: 10,
        }}
        >
        <button
            style={{
            fontSize: 20,
            padding: "4px 12px",
            border: "none",
            background: "#1976d2",
            color: "white",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: 4,
            }}
            onClick={() => {
            if (stageRef.current) {
                zoomStage(stageRef.current, 1.2);
            }
            }}
        >
            +
        </button>
        <button
            style={{
            fontSize: 20,
            padding: "4px 12px",
            border: "none",
            background: "#1976d2",
            color: "white",
            borderRadius: 4,
            cursor: "pointer",
            }}
            onClick={() => {
            if (stageRef.current) {
                zoomStage(stageRef.current, 0.8);
            }
            }}
        >
            –
        </button>
        </div>
    </React.Fragment>
  );
};

export default Canvas;
