"use client";
import React, { useState, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import useModelStore from '../_store/model';
import useServerStore from '../_store/server';
import "./style.css"


const Settings = ({ onChange }: { onChange: (ops: string[]) => void }) => {
  const runOps = useModelStore((s) => s.runOps);
  const setRunOps = useModelStore((s) => s.setRunOps);
  const baseServerURL = useServerStore((s) => s.baseServerURL)

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
      body: JSON.stringify({ ops: signal , TopOnly: true})
    });
    
    const result = await response.json();
    console.log(result)
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