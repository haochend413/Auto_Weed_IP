import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { FormGroup } from '@mui/material';

const Settings = () => {
    return (
        <FormGroup>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Checkbox />
                <span>Detection</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Checkbox />
                <span>Segmentation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Checkbox />
                <span>Classification</span>
            </div>
        </FormGroup>
        
    )
} 
export default Settings;  

