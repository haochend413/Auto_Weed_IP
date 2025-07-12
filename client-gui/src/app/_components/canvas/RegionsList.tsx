"use client";

import React from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import useStore from "../../_store/canvas";
import type { Region } from "../../_store/canvas";


type RegionItemProps = {  
  region: Region;
  onRemove: (id: string | number) => void;
};

const RegionItem: React.FC<RegionItemProps> = ({ region, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: region.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: `0 0 5px ${region.color}`,
    border: `1px solid ${region.color}`,
    padding: "8px",
    margin: "4px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>Region #{region.id}</span>
      <button onClick={() => onRemove(region.id)}>Delete</button>
    </div>
  );
};

const RegionList: React.FC = () => {
  const regions = useStore((s) => s.regions);
  const setRegions = useStore((s) => s.setRegions);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = regions.findIndex((r) => r.id === active.id);
      const newIndex = regions.findIndex((r) => r.id === over.id);
      setRegions(arrayMove(regions, oldIndex, newIndex));
    }
  };

  const handleRemove = (id: string | number) => {
    const newRegions = regions.filter((r) => r.id !== id);
    setRegions(newRegions);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={regions.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="regions-list">
          {regions.map((region) => (
            <RegionItem
              key={region.id}
              region={region}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default RegionList;
