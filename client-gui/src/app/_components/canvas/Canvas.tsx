"use client"; 
import React, { useEffect, useRef } from 'react';
import Konva from 'konva';

import useStore from '../../store';

let id = 1;

function getRelativePointerPosition(node: Konva.Node) {
  const transform = node.getAbsoluteTransform().copy();
  transform.invert();
  const stage = node.getStage();
  const pos = stage ? stage.getPointerPosition() : null;
  return pos ? transform.point(pos) : { x: 0, y: 0 };
}

function zoomStage(stage: Konva.Stage, scaleBy: number) {
  const oldScale = stage.scaleX();
  const pos = { x: stage.width() / 2, y: stage.height() / 2 };
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
  if (!imageNode) return { x: newAttrs.x, y: newAttrs.y, scale: newAttrs.scale };
  const box = imageNode.getClientRect();
  const minX = -box.width + stage.width() / 2;
  const maxX = stage.width() / 2;
  const minY = -box.height + stage.height() / 2;
  const maxY = stage.height() / 2;
  const x = Math.max(minX, Math.min(newAttrs.x, maxX));
  const y = Math.max(minY, Math.min(newAttrs.y, maxY));
  const scale = Math.max(0.05, newAttrs.scale);
  return { x, y, scale };
}

const Canvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
const imageLayerRef = useRef<Konva.Layer | null>(null);
const regionLayerRef = useRef<Konva.Layer | null>(null);

  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);
  const setSize = useStore((s) => s.setSize);
  const scale = useStore((s) => s.scale);
  const isDrawing = useStore((s) => s.isDrawing);
  const toggleDrawing = useStore((s) => s.toggleIsDrawing);
  const regions = useStore((s) => s.regions);
  const setRegions = useStore((s) => s.setRegions);
  const selectRegion = useStore((s) => s.selectRegion);
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const stage = new Konva.Stage({
    container,
    width,
    height,
  });
  stageRef.current = stage;

  const imageLayer = new Konva.Layer();
  imageLayerRef.current = imageLayer;
  stage.add(imageLayer);

  const regionLayer = new Konva.Layer();
  regionLayerRef.current = regionLayer;
  stage.add(regionLayer);

  // Load and display base image
  const imageObj = new window.Image();
  imageObj.src = '/image-1.jpg';
  imageObj.onload = () => {
    const konvaImage = new Konva.Image({ image: imageObj });
    imageLayer.add(konvaImage);
    imageLayer.draw();
  };

  function redrawRegions() {
    if (!regionLayer) return;
    regionLayer.find('.region').forEach(node => node.destroy());

    regions.forEach(region => {
      const line = new Konva.Line({
        points: region.points.flatMap(p => [p.x, p.y]),
        stroke: region.color,
        strokeWidth: 2,
        closed: true,
        fill: region.color + '33',
        name: 'region',
      });
      regionLayer.add(line);
    });

    regionLayer.draw();
  }

  redrawRegions();

    const checkSize = () => {
      const container = document.querySelector('.right-panel') as HTMLElement | null;
      if (container) {
        setSize({
          width: container.offsetWidth,
          height: height,
        });
        stage.size({ width: container.offsetWidth, height: height });
      }
    }; 

    checkSize(); 
    window.addEventListener('resize', checkSize);

    stage.on('click', (e) => {
      if (e.target.name() !== 'region') {
        selectRegion(null);
      }
    });
 
    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const dx = -e.evt.deltaX;
      const dy = -e.evt.deltaY;
      const pos = limitAttributes(stage, {
        x: stage.x() + dx,
        y: stage.y() + dy,
        scale: stage.scaleX(),
      });
      stage.position(pos);
      stage.batchDraw();
    });

    stage.on('mousedown', (e) => {
      toggleDrawing();
      const point = getRelativePointerPosition(stage);
      const region = {
        id: id++,
        color: Konva.Util.getRandomColor(),
        points: [point],
      };
      setRegions(regions.concat([region]));
    });

    stage.on('mousemove', (e) => {
      if (!isDrawing) return;
      const lastRegion = { ...regions[regions.length - 1] };
      const point = getRelativePointerPosition(stage);
      lastRegion.points = lastRegion.points.concat([point]);
      const newRegions = regions.slice(0, -1).concat(lastRegion);
      setRegions(newRegions);
      redrawRegions();
    });

    stage.on('mouseup', () => {
      if (!isDrawing) return;
      const lastRegion = regions[regions.length - 1];
      if (lastRegion.points.length < 3) {
        const newRegions = regions.slice(0, -1);
        setRegions(newRegions);
      }
      toggleDrawing();
    });

    return () => {
      window.removeEventListener('resize', checkSize);
      stage.destroy();
    };
  }, [width, height,regions]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div
        className="zoom-container"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: 8,
          zIndex: 10,
        }}
      >
        <button
          style={{
            fontSize: 20,
            padding: '4px 12px',
            border: 'none',
            background: '#1976d2',
            color: 'white',
            borderRadius: 4,
            cursor: 'pointer',
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
            padding: '4px 12px',
            border: 'none',
            background: '#1976d2',
            color: 'white',
            borderRadius: 4,
            cursor: 'pointer',
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
    </div>
  );
};

export default Canvas;
