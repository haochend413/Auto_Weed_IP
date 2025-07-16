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

interface StoreState {
    width: number;
    height: number;
    setSize: (size: Size) => void; 

    imageWidth: number;
    imageHeight: number;
    setImageSize: (size: Size) => void;

    scale: number; 
    setScale: (scale: number) => void;

    isDrawing: boolean;
    toggleIsDrawing: () => void;

    regions: Region[];
    setRegions: (regions: Region[]) => void; 

    selectedRigionId: string | number | null;
    selectRegion: (selectedRigionId: string | number | null) => void;

    brightness: number;
    setBrightness: (brightness: number) => void;
}

const useCanvasStore = create<StoreState>(set => ({
    width: 500,
    height: 700,
    setSize: ({ width, height }: Size) => set({ width, height }),

    imageWidth: 0, 
    imageHeight: 0,

    setImageSize: (size: Size) =>
        set(() => ({ imageWidth: size.width, imageHeight: size.height })),
    scale: 1,
    setScale: (scale: number) => set({ scale }),
    isDrawing: false,
    toggleIsDrawing: () => set(state => ({ isDrawing: !state.isDrawing })),

    regions: [],
    setRegions: (regions: Region[]) => set(state => ({ regions })),

    selectedRigionId: null,
    selectRegion: (selectedRigionId: string | number | null) => set({ selectedRigionId }),

    brightness: 0,
    setBrightness: (brightness: number) => set({ brightness })
}));

export default useCanvasStore;
