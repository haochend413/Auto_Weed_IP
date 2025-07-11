"use client";
import React, { useEffect } from "react";
import Konva from "konva";
import useStore from "../../store";

const IMAGE_URL = "/image-1.jpg";

const BaseImage = ({ layer }: { layer: Konva.Layer }) => {
  const setImageSize = useStore((state) => state.setImageSize);
  const setScale = useStore((state) => state.setScale);
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);

  useEffect(() => {
    const imageObj = new window.Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = IMAGE_URL;

    imageObj.onload = () => {
      const konvaImage = new Konva.Image({ 
        image: imageObj, 
        x: 0,      // place image 100px from left of parent
        y: 0,      // place image 150px from top of parent 
    });
  

    //fit in
      const scale = Math.min(width / imageObj.width, height / imageObj.height);
      setScale(scale);
      setImageSize({ width: imageObj.width, height: imageObj.height });
      konvaImage.scale({ x: scale, y: scale });
      layer.add(konvaImage);
      layer.batchDraw();
    };

    return () => {
      layer.destroyChildren();
    };
  }, [layer, width, height, setScale, setImageSize]);

  return null;
};

export default BaseImage;
