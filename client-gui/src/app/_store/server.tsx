"use client"
import { create } from "zustand";

interface ServerStore {
    baseServerURL: string;
    setBaseServerURL: (newBase: string) => void;
}

const useServerStore = create<ServerStore>((set) => ({
    //first try this; if server is not avaliable through same wifi, we use local server; 
    baseServerURL: "http://192.168.10.252", 
    setBaseServerURL: (newBase) => set({ baseServerURL: newBase }),
}));  
export default useServerStore;
