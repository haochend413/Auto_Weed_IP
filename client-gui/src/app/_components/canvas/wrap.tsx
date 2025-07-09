"use client";
import React from "react";
import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";
// import useStore from "../../store";

const Wrap =  () => {

  return (
    <div className="App" style={{ display: 'flex', height: '100%' }}>
      <div className="left-panel" style={{ flex: 1, minWidth: 0 }}>
        <Canvas />
      </div>
      <div className="right-panel" style={{ flex: 1, minWidth: 0 }}>
        <RegionsList />
      </div>
    </div>
  );
};

export default Wrap; 