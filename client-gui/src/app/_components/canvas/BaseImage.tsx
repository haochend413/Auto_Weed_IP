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
  const width = useCanvasStore((state) => state.width);
  const height = useCanvasStore((state) => state.height);

  useEffect(() => {
    const imageObj = new window.Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = imageUrl ?? ""; 
    console.log("a") 

    console.log(imageUrl) 
    imageObj.onload = () => {
      const konvaImage = new Konva.Image({ 
        image: imageObj, 
        x: 0,      // place image 100px from left of parent
        y: 0,      // place image 150px from top of parent 
    });
    
    console.log(imageObj.width)
    console.log(imageObj.height)
  

    //fit in
      const scale = Math.min(width / imageObj.width, height / imageObj.height);
      console.log(scale)
      setScale(scale);
      setImageSize({ width: imageObj.width, height: imageObj.height });
      konvaImage.scale({ x: scale, y: scale });
      layer.add(konvaImage);
      layer.batchDraw();
    };

    return () => {
      layer.destroyChildren();
    };
  }, [layer, width, height, setScale, setImageSize, imageUrl]);

  return null;
};

export default BaseImage;
