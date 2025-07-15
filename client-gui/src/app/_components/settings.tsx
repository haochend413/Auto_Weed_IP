"use client";
import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import useModelStore from '../_store/model';
import useServerStore from '../_store/server';
import useCanvasStore, {Region} from '../_store/canvas';

import "./style.css"


const Settings = ({ onChange }: { onChange: (ops: string[]) => void }) => {
  const runOps = useModelStore((s) => s.runOps);
  const setRunOps = useModelStore((s) => s.setRunOps);
  const baseServerURL = useServerStore((s) => s.baseServerURL)
  const regions = useCanvasStore((s) => s.regions)
  const setRegions = useCanvasStore((s) => s.setRegions)

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
    console.log(result)
    const firstImgName = Object.keys(result)[0];
    const seg = result[firstImgName]["segment"];
  
      //create new region
      console.log(seg[0])
      
    for (const [idx, r] of seg.entries()) {
      for (const contour of r) { 
        const newPoints = contour.map(([x, y]: [number, number]) => ({ x, y }));
        const newRegion: Region = {
          id: `region-${idx}`,
          points: newPoints,
          color: "#ff0000" 
        };
        setRegions([...regions, newRegion]);
      }
    }
   
      // console.log(regions)
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