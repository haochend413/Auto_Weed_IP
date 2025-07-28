"use client";
import React, { useEffect } from "react";
import Konva from "konva";
import useCanvasStore from "../../_store/canvas";
import useImageStore from "../../_store/img";


// const IMAGE_URL = "/image-1.jpg";

const BaseImage = ({ layer }: { layer: Konva.Layer }) => {
  //use size to set baseimage; 
  const imageUrl = useImageStore((s) => s.imageUrl)
  const setImageSize = useCanvasStore((state) => state.setImageSize);
  const setScale = useCanvasStore((state) => state.setScale);
  const setOrigScale = useCanvasStore((state) => state.setOrigScale);
  const width = useCanvasStore((state) => state.width);
  const height = useCanvasStore((state) => state.height);
  useEffect(() => {
    if (!imageUrl) return;

    console.log("BaseImage useEffect triggered", imageUrl);

    const imageObj = new window.Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = imageUrl;

    imageObj.onload = () => {
      console.time("Total onload");
      
      console.time("Destroy children");
      layer.destroyChildren();
      console.timeEnd("Destroy children");
      
      console.time("Create Konva.Image");
      const konvaImage = new Konva.Image({
        image: imageObj,
        x: 0,
        y: 0,
      });
      console.timeEnd("Create Konva.Image");
      
      console.time("Calculate and set scale");
      const scale = Math.min(width / imageObj.width, height / imageObj.height);
      setScale(scale);
      setOrigScale(scale);
      setImageSize({ width: imageObj.width, height: imageObj.height });
      console.timeEnd("Calculate and set scale");
      
      console.time("Layer operations");
      layer.scale({ x: scale, y: scale });
      layer.add(konvaImage);
      layer.batchDraw();
      console.timeEnd("Layer operations");
      
      console.timeEnd("Total onload");
      console.log("Image dimensions:", imageObj.width, imageObj.height);
  };

    imageObj.onerror = (err) => {
      console.error("Image failed to load", err);
    };

    return () => {
      console.log("BaseImage cleanup triggered");
      // layer.destroyChildren();
    };
  }, [imageUrl, width, height, setScale, setImageSize, layer]);

  return null;
};

export default BaseImage;
