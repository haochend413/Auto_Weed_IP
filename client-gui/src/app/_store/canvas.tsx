"use client"
import { create } from "zustand";

interface Size {
    width: number;
    height: number;
}

export interface Region {
    id: string | number;
    points: { x: number; y: number }[];
    color: string; 
    // Add more properties as needed
}

export interface Border {
    id: string | number;
    x: number;
    y: number; 
    height: number;
    width: number;
    color: string; 
}

interface StoreState {
    width: number;
    height: number;
    setSize: (size: Size) => void; 

    imageWidth: number;
    imageHeight: number;
    setImageSize: (size: Size) => void;

    scale: number; 
    setScale: (scale: number) => void;
    origScale: number; 
    setOrigScale: (origScale: number) => void; 

    isDrawing: boolean;
    toggleIsDrawing: () => void;

    regions: Region[];
    setRegions: (regions: Region[]) => void; 
    borders: Border[]; 
    setBorders: (borders: Border[]) => void; 

    selectedRigionId: string | number | null;
    selectRegion: (selectedRigionId: string | number | null) => void;

    brightness: number;
    setBrightness: (brightness: number) => void;
} 

const useCanvasStore = create<StoreState>(set => ({
    width: 1000,
    height: 700,
    setSize: ({ width, height }: Size) => set({ width, height }),

    imageWidth: 0, 
    imageHeight: 0,

    setImageSize: (size: Size) =>
        set(() => ({ imageWidth: size.width, imageHeight: size.height })),
    scale: 1,
    setScale: (scale: number) => set({ scale }),
    origScale: 1, 
    setOrigScale: (origScale: number) => set({ origScale }),

    isDrawing: false,
    toggleIsDrawing: () => set(state => ({ isDrawing: !state.isDrawing })),

    regions: [],
    setRegions: (regions: Region[]) => set(({ regions })), 
    borders: [],
    setBorders: (borders: Border[]) => set(({ borders })), 

    selectedRigionId: null,
    selectRegion: (selectedRigionId: string | number | null) => set({ selectedRigionId }),

    brightness: 0,
    setBrightness: (brightness: number) => set({ brightness })
}));

export default useCanvasStore;
