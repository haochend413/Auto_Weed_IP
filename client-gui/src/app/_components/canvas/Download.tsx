"use client";
import React, {useRef, useState} from "react";
import dynamic from 'next/dynamic';
import Konva from "konva";
import "./style.css";
import useCanvasStore from "../../_store/canvas";
import useServerStore from "@/app/_store/server";
const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
import BorderList from "./BordersList";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


export function Download() {
    //Data required for cv2
    const baseServerURL = useServerStore((s) => s.baseServerURL)
    const regions = useCanvasStore((s) => s.regions);
    const borders = useCanvasStore((s) => s.borders);
    const origScale = useCanvasStore((s) => s.origScale); 



    const handleDownload = async () => {

        const regionsPayload = regions.map(region =>
            region.points.map(pt => [pt.x / origScale, pt.y / origScale])
        );

        const bordersPayload = borders.map(border => [
            [border.x / origScale, border.y / origScale],
            [border.x / origScale + border.width / origScale, border.y / origScale + border.height / origScale]
        ]);
        console.log(regionsPayload)
        console.log(bordersPayload)

        const payload = {
            regions: regionsPayload,
            boxes: bordersPayload
        };
        console.log(JSON.stringify(payload, null, 2)); 

        const response = await fetch(baseServerURL + "/gui/download_p", {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
 
            return;
        }

        //download; 
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "processed.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);


    }
    return <Button             
            style={{
              background: "#1976d2",
              color: "white",
              border: "none",
              padding: "12px 32px",
              fontWeight: 600,
              fontSize: 18,
              boxShadow: "0 2px 8px rgba(25,118,210,0.12)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={()=>handleDownload()}> Download CV2 Rendered; </Button>
}