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

//set the scale and position of the stage and layers to original; 
export function setFitCanvas(stage: Konva.Stage | null, origScale: number) {
  if (!stage) {
    return; 
  }
 
  stage.scale({x: origScale, y: origScale}); //stage
    // Set scale for all layers in the stage
  stage.getLayers().forEach(layer => {
    layer.scale({ x: origScale, y: origScale });
    layer.batchDraw();
  });
}