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

import useCanvasStore from "../../_store/canvas";
import type { Border } from "../../_store/canvas";
import { colors } from "@mui/material";


type BorderItemProps = {  
  border: Border;
  onRemove: (id: string | number) => void;
};

const BorderItem: React.FC<BorderItemProps> = ({ border, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: border.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: `0 0 5px ${border.color}`,
    border: `1px solid ${border.color}`,
    padding: "8px",
    margin: "4px 0",
    display: "flex",
    color: "black", 
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    cursor: "grab",
    
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <span>Border #{border.id}</span>
      <button
        onClick={() => onRemove(border.id)}
        style={{
          backgroundColor: "grey",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "2px 4px",
          marginLeft: "12px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "background 0.2s",
        }}
        title="Delete this region"
      >
        Delete
      </button>
    </div>
  );
};

const BorderList: React.FC = () => {
  const borders = useCanvasStore((s) => s.borders);
  const setBorders = useCanvasStore((s) => s.setBorders);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = borders.findIndex((r) => r.id === active.id);
      const newIndex = borders.findIndex((r) => r.id === over.id);
      setBorders(arrayMove(borders, oldIndex, newIndex));
    }
  };

  const handleRemove = (id: string | number) => {
    const newBorders = borders.filter((r) => r.id !== id);
    setBorders(newBorders);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={borders.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="regions-list">
          {borders.map((border) => (
            <BorderItem
              key={border.id}
              border={border}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default BorderList;
