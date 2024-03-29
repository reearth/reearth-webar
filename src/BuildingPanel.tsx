// import { List, Icon, Tooltip, IconButton, Divider } from "@mui/material";
// import { values } from "lodash-es";
// import { title } from "process";
// import { Inspector, InspectorHeader, LayerIcon, VisibilityOffIcon, VisibilityOnIcon } from "./components/prototypes/ui-components";
// import { TileFeaturePropertiesSection } from "./components/prototypes/view/selection/TileFeaturePropertiesSection";

// // SelectionPanelにおいてScreenSpaceSelectionでビルが選択された場合にInspectorのcontentとして
// // TileFeatureContentを表示する場合に限定して、それを参考とし、ARでは単一のビル選択のみであるとして独自に実装。
// export default function BuildingPanel({...props}) {
//   return (
//     <Inspector
//       key="default"
//       defaultWidth={inspectorWidth}
//       onResizeStop={handleResizeStop}
//       scrollable={useScrollable}>
//       <List disablePadding>
//       <InspectorHeader
//         // TODO: Change name and icon according to the feature type.
//         title={title}
//         iconComponent={Icon}
//         actions={
//           isBuildingModel ? (
//             <>
//               <Tooltip title="レイヤーを選択">
//                 <IconButton aria-label="レイヤーを選択" onClick={handleSelectLayers}>
//                   <LayerIcon />
//                 </IconButton>
//               </Tooltip>
//               <Tooltip title={hidden ? "表示" : "隠す"}>
//                 <IconButton
//                   aria-label={hidden ? "表示" : "隠す"}
//                   onClick={hidden ? handleShow : handleHide}>
//                   {hidden ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
//                 </IconButton>
//               </Tooltip>
//             </>
//           ) : undefined
//         }
//         onClose={handleClose}
//       />
//       <Divider />
//       <TileFeaturePropertiesSection values={values} />
//     </List>
//     </Inspector>
//   );
// }