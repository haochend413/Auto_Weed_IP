import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';

const Settings = ({ onChange }: { onChange: (ops: string[]) => void }) => {
  const [checked, setChecked] = useState({
    detect: false,
    segment: false,
    classify: false,
  });

  const handleChange = (name: keyof typeof checked) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newChecked = { ...checked, [name]: event.target.checked };
    setChecked(newChecked);

    //select the activated operations
    const selected = Object.entries(newChecked)
      .filter(([_, v]) => v)
      .map(([k]) => k);
    onChange(selected);
  };

  return (
    <Stack direction="row" spacing={2}>
      <label>
        <Checkbox checked={checked.detect} onChange={handleChange('detect')} />
        Detection
      </label>
      <label>
        <Checkbox checked={checked.segment} onChange={handleChange('segment')} />
        Segmentation
      </label>
      <label>
        <Checkbox checked={checked.classify} onChange={handleChange('classify')} />
        Classification
      </label>
    </Stack>
  );
};

export default Settings;