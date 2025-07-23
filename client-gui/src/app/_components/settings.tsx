"use client";
import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import useModelStore from '../_store/model';
import useServerStore from '../_store/server';
import useCanvasStore, {Region, Border} from '../_store/canvas';

import "./style.css"

//This SCALE is for sizes change between image-canvas, has nothing to do with cv2 ! 
const SCALE = 0.175; 

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

  // Local state for checkboxes as a Map
  const [checked, setChecked] = useState<Map<string, boolean>>(
    new Map([
      ["detect", false],
      ["segment", false],
      ["classify", false],
      ])
    ); 

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

    //only capture the first item in the response; 
    const firstImgName = Object.keys(result)[0];
    const seg = result[firstImgName]["segment"];
    const det = result[firstImgName]["detect"]; 
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
            
            

          } else {
            // console.warn(`Skipping non-array contour: ${contour}`);
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
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newChecked = new Map(checked);
    newChecked.set(name, event.target.checked);
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
        <label className="checkbox">
          <Checkbox checked={checked.get("detect") || false} onChange={handleChange("detect")} />
          Detection
        </label>
        <label className="checkbox">
          <Checkbox checked={checked.get("segment") || false} onChange={handleChange("segment")} />
          Segmentation
        </label>
        <label className="checkbox">
          <Checkbox checked={checked.get("classify") || false} onChange={handleChange("classify")} />
          Classification
        </label>
      </Stack>
      <button className='run-btn' onClick={HandleRun}>
        Run
      </button>
    </div>
  );
};

export default Settings;