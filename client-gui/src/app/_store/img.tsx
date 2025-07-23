"use client"
import { create } from "zustand";

interface ImageStore {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  scale: number;
  setScale: (scale: number) => void; 
}

const useImageStore = create<ImageStore>((set) => ({
  imageUrl: null,
  setImageUrl: (url) => set({ imageUrl: url }),
  scale: 1, 
  setScale: (scale) => set({scale: scale})
}));

export default useImageStore;