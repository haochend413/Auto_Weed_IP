// import React from "react";
// import { SortableContainer, SortableElement } from "react-sortable-hoc";
// import { arrayMoveMutable} from "array-move";

// import useStore from "../../store";
// import type {Region} from "../../store";


// type SortableItemProps = {
//   region: Region;
//   sortIndex: number;
//   onRemove: (index: number) => void;
// };

// const SortableItem = SortableElement(({ region, sortIndex, onRemove }: SortableItemProps) => {
//   return (
//     <div
//       className="region"
//       style={{
//         boxShadow: `0 0 5px ${region.color}`,
//         border: `1px solid ${region.color}`
//       }}
//     >
//       Region #{region.id}
//       <button
//         onClick={() => {
//           onRemove(sortIndex);
//         }}
//       >
//         Delete
//       </button>
//     </div>
//   );
// });


// type SortableContainerProps = {
//   items: Region[];
//   onRemove: (index: number) => void;
// };

// const SortableList = SortableContainer(({ items, onRemove }: SortableContainerProps) => {
//   return (
//     <div className="regions-list">
//       {items.map((region, index) => (
//         <SortableItem
//           key={`item-${region.id}`}
//           index={index}
//           region={region}
//           onRemove={onRemove}
//           sortIndex={index}
//         />
//       ))}
//     </div>
//   );
// });

// export default () => {
//   const regions = useStore(s => s.regions);
//   const setRegions = useStore(s => s.setRegions);

//   return (
//     <SortableList
//       items={regions}
//       onSortEnd={({ oldIndex, newIndex }) => {
//         setRegions(arrayMoveMutable(regions, oldIndex, newIndex));
//       }}
//       onRemove={index => {
//         regions.splice(index, 1);
//         setRegions(regions.concat());
//       }}
//     />
//   );
// };
