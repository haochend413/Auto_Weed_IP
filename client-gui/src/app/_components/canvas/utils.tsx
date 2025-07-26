import Konva from 'konva'
import useCanvasStore from '@/app/_store/canvas';




//draw with pointer on layer
export function getRelativePointerPosition(stage: Konva.Stage, layer: Konva.Layer) {
  const transform = layer.getAbsoluteTransform().copy();
  transform.invert();
  const pos = stage.getPointerPosition();
  return pos ? transform.point(pos) : { x: 0, y: 0 };
}

//on pinch zoom stage
export function zoomStage(stage: Konva.Stage, scaleBy: number) {
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

//on pinch zoom layer
export function zoomLayer(layer: Konva.Layer, scaleBy: number) {
  const oldScale = layer.scaleX(); 
  const mousePointTo = { 
    x: layer.width() / 2 / oldScale - layer.x() / oldScale,
    y: layer.height() / 2 / oldScale - layer.y() / oldScale,
  };
  const newScale = Math.max(0.05, oldScale * scaleBy);
  const newPos = {
    x: -(mousePointTo.x - layer.width() / 2 / newScale) * newScale,
    y: -(mousePointTo.y - layer.height() / 2 / newScale) * newScale,
  };
  layer.scale({ x: newScale, y: newScale });
  layer.position(newPos);
  layer.batchDraw();
}

export function setFitCanvas(
  stage: Konva.Stage | null,
  layers: (Konva.Layer | null)[],
  imageLayer: Konva.Layer | null,
  origScale: number
) {
  if (!stage) return;

  // 1. Reset stage
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });

  // 2. Reset all layers
  layers.forEach(layer => {
    if (layer) {
      layer.scale({ x: 1, y: 1 });
      layer.position({ x: 0, y: 0 });
      layer.batchDraw();
    }
  });

  // 3. Fit base image layer (scale image to fit canvas)
  if (imageLayer && imageLayer.children.length > 0 ) {
    const img = imageLayer.children[0];
    
    img.scale({ x: origScale, y: origScale });
    img.position({ x: 0, y: 0 });
    imageLayer.batchDraw();
  }

  stage.batchDraw();
}