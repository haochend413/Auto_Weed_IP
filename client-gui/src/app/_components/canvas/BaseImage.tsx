"use client";
import React, { useEffect, useRef } from "react";
import Konva from "konva";
import useStore from "../../store";

const IMAGE_URL = "/image-1.jpg";

const BaseImage = () => {
  const setImageSize = useStore((state) => state.setImageSize);
  const setScale = useStore((state) => state.setScale);
  const setSize = useStore((state) => state.setSize);
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);

  const layerRef = useRef<Konva.Layer | null>(null);
  const imageNodeRef = useRef<Konva.Image | null>(null);

  useEffect(() => {
    const imageObj = new window.Image();
    imageObj.crossOrigin = "anonymous";
    imageObj.src = IMAGE_URL;

    imageObj.onload = () => {
      if (!layerRef.current) {
        const layer = new Konva.Layer();
        layerRef.current = layer;
      }

      const konvaImage = new Konva.Image({
        image: imageObj,
      });
      imageNodeRef.current = konvaImage;

      const stage = konvaImage.getStage() || layerRef.current?.getStage();
      if (!stage) {
        console.warn("Stage not available; ensure BaseImage is added to stage correctly.");
      }

      const scale = Math.min(width / imageObj.width, height / imageObj.height);
      setScale(scale);
      setImageSize({ width: imageObj.width, height: imageObj.height });

      layerRef.current?.add(konvaImage);
      layerRef.current?.batchDraw();
    };

    return () => {
      layerRef.current?.destroyChildren();
      layerRef.current?.destroy();
    };
  }, [width, height, setScale, setImageSize, setSize]);

  return null; // naive Konva handles rendering
};

export default BaseImage;