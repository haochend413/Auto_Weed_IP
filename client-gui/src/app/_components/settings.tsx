"use client";
import React, { useState, useEffect } from 'react';
// import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import useModelStore from '../_store/model';
import useServerStore from '../_store/server';
import useCanvasStore, {Region, Border} from '../_store/canvas';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import "./style.css"

//This SCALE is for sizes change between image-canvas, has nothing to do with cv2 ! 
// const SCALE = 0.15575; 

const Settings = ({ onChange }: { onChange: (ops: string[]) => void }) => {
  const runOps = useModelStore((s) => s.runOps);
  const setRunOps = useModelStore((s) => s.setRunOps);
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  //regions
  const regions = useCanvasStore((s) => s.regions)
  const setRegions = useCanvasStore((s) => s.setRegions)
  //borders
  const borders = useCanvasStore((s) => s.borders)
  const setBorders = useCanvasStore((s) => s.setBorders) 
  //scale
  const SCALE = useCanvasStore((s) => s.scale)
  //imgs

  // Local state for checkboxes as a Map
  const [checked, setChecked] = useState<Map<string, boolean>>(
    new Map([
      ["detect", false],
      ["segment", false],
      ["classify", false],
      ])
    ); 
  //need change! 
  const HandleRun = async () => { 
    //detect, segment, classify
    const signal = [
        runOps.get("detect") || false, 
        runOps.get("segment") || false, 
        runOps.get("classify") || false
    ];

    const response = await fetch(baseServerURL + "/model/combined", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      //APIs 
      body: JSON.stringify({ ops: signal , TopOnly: true})
    });
    
    const result = await response.json();  

    //demo latest image 
    const firstImgName = Object.keys(result)[0];
    const seg = result[firstImgName]["segment"];
    const det = result[firstImgName]["detect"]; 
    // result needs to return the size of the image; 
    // console.log(det)

    // console.log(seg) 
    if (checked.get("segment")) {
      const newRegions: Region[] = [];
          
      let level = 0;
      let count = 0;
  
      for (const [idx, r] of seg.entries()) {
        level += 1; 
        for (const contour of r) { 
          count += 1;
          console.log("contour", contour);
          
          if (Array.isArray(contour)) {
            try {
              const newPoints = contour.map(([x, y]: [number, number]) => ({
                x: x * SCALE,
                y: y * SCALE
              }));
              const newRegion: Region = {
              id: `region-${level}-${count}`,
              points: newPoints,
              color: "#ff0000" 
            };
            // console.log("new region", newRegion);
            
            // Add to our collection instead of updating state
            newRegions.push(newRegion);
            } catch(e) {
            }
          } 
        }
      }
      
      // Now update state once with all the new regions
      if (newRegions.length > 0) {
        console.log(`Adding ${newRegions.length} new regions`);
        setRegions([...regions, ...newRegions]);
      }
    }
    

    if (checked.get("detect")) {
      const newBorders: Border[] = []; 
      let l = 0;  
      for (const [idx, box] of det.entries()) {
        l += 1;
        if (Array.isArray(box)) {
          const newBorder: Border = {
            id: `border-${l}`,
            x: box[0] * SCALE,
            y: box[1] * SCALE, 
            width: (box[2] - box[0]) * SCALE, 
            height:(box[3] - box[1]) * SCALE, 
            color: "#1900ffff" 
          };
          // console.log("new region", newRegion);
          
          // Add to our collection instead of updating state
          newBorders.push(newBorder);
        }
      }
      
      // Now update state once with all the new regions
      if (newBorders.length > 0) {
        console.log(`Adding ${newBorders.length} new borders`);
        setBorders([...borders, ...newBorders]);
      }
    }
    
  }

  // Sync zustand state with local state
  useEffect(() => {
    setChecked(new Map([
      ["detect", runOps.get("detect") || false], 
      ["segment", runOps.get("segment") || false], 
      ["classify", runOps.get("classify") || false], 
    ]));
  }, [runOps]);

  const handleChange = (name: string) => (
    checkedValue: boolean | "indeterminate"
  ) => {
    const newChecked = new Map(checked);
    newChecked.set(name, checkedValue === true);
    setChecked(newChecked);
    // Update zustand state
    setRunOps(new Map(newChecked));
    const selected = Array.from(newChecked.entries())
      .filter(([_, v]) => v)
      .map(([k]) => k);
    onChange(selected);
    console.log("Updated runOps:", selected);
  };

return (
  <div>
    <Stack direction="column" spacing={2}>
      <Label
        htmlFor="toggle-detect"
        className={`w-40 flex items-start gap-3 rounded-lg border p-3 transition-colors
          ${checked.get("detect")
            ? "border-blue-600 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
            : "border-gray-300 bg-transparent dark:border-gray-700"}
          hover:bg-accent/50`}
      >
        <Checkbox
        style={{
          width: 20,
        }}
          checked={checked.get("detect") || false}
          id="toggle-detect"
          onCheckedChange={handleChange("detect")}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className={`text-sm leading-none font-medium ${checked.get("detect") ? "text-blue-700 dark:text-blue-300" : "text-white"}`}>
            Detection
          </p>
        </div>
      </Label>
      <Label
        htmlFor="toggle-segment"
        className={`w-40 flex items-start gap-3 rounded-lg border p-3 transition-colors
          ${checked.get("segment")
            ? "border-blue-600 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
            : "border-gray-300 bg-transparent dark:border-gray-700"}
          hover:bg-accent/50`}
      >
        <Checkbox
          checked={checked.get("segment") || false}
          id="toggle-segment"
          onCheckedChange={handleChange("segment")}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className={`text-sm leading-none font-medium ${checked.get("segment") ? "text-blue-700 dark:text-blue-300" : "text-white"}`}>
            Segmentation
          </p>
        </div>
      </Label>
      <Label
        htmlFor="toggle-classify"
        className={`w-40 flex items-start gap-3 rounded-lg border p-3 transition-colors
          ${checked.get("classify")
            ? "border-blue-600 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
            : "border-gray-300 bg-transparent dark:border-gray-700"}
          hover:bg-accent/50`}
      >
        <Checkbox
          checked={checked.get("classify") || false}
          id="toggle-classify"
          onCheckedChange={handleChange("classify")}
          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
        />
        <div className="grid gap-1.5 font-normal">
          <p className={`text-sm leading-none font-medium ${checked.get("classify") ? "text-blue-700 dark:text-blue-300" : "text-white"}`}>
            Classification
          </p>
        </div>
      </Label>
    </Stack>
    <button className='run-btn' onClick={HandleRun}>
      Run
    </button>
  </div>
);
};

export default Settings;