"use client"
import { create } from "zustand";



// We do not need this; this is for local storage; 
interface ImageData {
    regions: number[][][];        
    boxes: number[][][];          
    classification: string;
}

interface DataStore {
    // imgMap: Map<string, ImageData>; //path to data; 
    imgs: string[], 
    addImg: (name: string) => void,
    deleteImg : (name: string) => void, 
}

const useDataStore = create<DataStore>((set) => ({
    // imgMap: new Map(),
    imgs: [], 
    addImg: (name) =>
        set((state) => ({
            imgs: [...state.imgs, name]
        })), 
    deleteImg: (name) =>
        set((state) => ({
            imgs: state.imgs.filter(img => img !== name)
        })),
}));



export default useDataStore; 