"use client"
import { create } from "zustand";

interface ImageStore {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

const useImageStore = create<ImageStore>((set) => ({
  imageUrl: null,
  setImageUrl: (url) => set({ imageUrl: url }),
}));

export default useImageStore;