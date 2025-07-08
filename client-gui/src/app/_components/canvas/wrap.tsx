import React from "react";

import dynamic from 'next/dynamic';

const Canvas = dynamic(() => import('./Canvas'), { ssr: false });
import RegionsList from "./RegionsList";

import useStore from "../../store";

const Wrap =  () => {
  const { setBrightness } = useStore(); 

  return (
    <React.Fragment>

      <div className="App">
        <div className="left-panel">
          <RegionsList />
        </div>
        <div className="right-panel">
          <Canvas />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Wrap;
