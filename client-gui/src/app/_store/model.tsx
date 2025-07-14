"use client"
import { create } from "zustand";

interface ModelStore {
    runOps: Map<string, boolean>;
    setRunOps: (ops: Map<string, boolean>) => void;
}

const useModelStore = create<ModelStore>((set) => ({
  runOps: new Map([
    ["detect", false],
    ["segment", false],
    ["classify", false],
  ]),
  setRunOps: (ops: Map<string, boolean>) => set({ runOps: ops }),
}));
export default useModelStore;