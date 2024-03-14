import { useEffect, useMemo, useState } from "react";
import { startAR, stopAR, resetTileset, updateCompassBias, updateFov, pickUpFeature } from "./ar";
import { useAtom, useAtomValue } from "jotai";
import { useSearchParams } from "react-router-dom";
import queryString from "query-string";
import { useDatasetById, useDatasetsByIds } from "./components/shared/graphql";
import { PlateauDataset, PlateauDatasetItem } from "./components/shared/graphql/types/catalog";
import { rootLayersAtom } from "./components/shared/states/rootLayer";
import { createRootLayerAtom } from "./components/shared/view-layers";
import { settingsAtom } from "./components/shared/states/setting";
import { templatesAtom } from "./components/shared/states/template";
import { removeLayerAtom, useAddLayer } from "./components/prototypes/layers";
import { compassBiasAtom, fovPiOverAtom, cesiumLoadedAtom } from "./components/prototypes/view/states/ar";

function tilesetUrls(plateauDatasets: [PlateauDataset]): string[] {
  return plateauDatasets.map(plateauDataset => {
    const plateauDatasetItems = plateauDataset.items as [PlateauDatasetItem];
    // LOD2(テクスチャあり)->LOD2(テクスチャなし)->LOD1の順でフォールバック
    const tilesetUrlLod2TexItem = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "TEXTURE")
    if (tilesetUrlLod2TexItem && tilesetUrlLod2TexItem.url) {
      return tilesetUrlLod2TexItem.url;
    } else {
      const tilesetUrlLod2NoneTexItem = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "NONE")
      if (tilesetUrlLod2NoneTexItem && tilesetUrlLod2NoneTexItem.url) {
        return tilesetUrlLod2NoneTexItem.url;
      } else {
        const tilesetUrlLod1Item = plateauDatasetItems.find(({ lod }) => lod == 1)
        if (tilesetUrlLod1Item && tilesetUrlLod1Item.url) {
          return tilesetUrlLod1Item.url;
        } else {
          return null;
        }
      }
    }
  }).filter(x => x);
}

export default function ARView({...props}) {
  // 開始時にクエパラでデータセットIDを指定された場合にデータセットパネルの初期化に使用するデータセット群 (レンダリング毎に忘却したいのでStateにはしない)
  let initialPlateauDatasets: [PlateauDataset];
  // 開始時にクエパラでデータセットIDを指定された場合にARViewの初期化に使用するtilesetURL (レンダリング毎に忘却したいのでStateにはしない)
  let initialTilesetUrls: string[];
  // クエパラを見てPLATEAU ViewからのデータセットID群の初期値が来ていれば取得し、tilesetURL群に変換
  const searchQueryParams = queryString.parse(location.search, {arrayFormat: 'comma'});
  let initialDatasetIds = searchQueryParams.id ?? [];
  if (typeof initialDatasetIds === 'string') { initialDatasetIds = [initialDatasetIds]; }
  // フックの数を変えないためにもしクエパラがundefinedでも空配列で必ずクエリを呼び出す
  const { data } = useDatasetsByIds(initialDatasetIds);
  if (data) {
    initialPlateauDatasets = data.nodes as [PlateauDataset];
    // useDatasetsByIdsクエリが中身のあるデータを返してくるまでは待機
    if (initialPlateauDatasets) {
      initialTilesetUrls = tilesetUrls(initialPlateauDatasets);
      console.log("initialTilesetUrls: ", initialTilesetUrls);
    }
  }

  // データセットパネルに追加されたレイヤー群と関連フック
  const rootLayers = useAtomValue(rootLayersAtom);
  const addLayer = useAddLayer();
  const settings = useAtomValue(settingsAtom);
  const templates = useAtomValue(templatesAtom);

  // クエパラから来たデータセットID群をデータセットパネルに同期
  useEffect(() => {
    if (!initialPlateauDatasets || !initialPlateauDatasets.length) { return; }
    initialPlateauDatasets.map(dataset => {
      const datasetId = dataset.id;
      const rootLayersDatasetIds = rootLayers.map(rootLayer => rootLayer.rawDataset.id);
      if (rootLayersDatasetIds.includes(datasetId)) { return; }
      const filteredSettings = settings.filter(s => s.datasetId === datasetId);
      addLayer(
        createRootLayerAtom({
          dataset,
          settings: filteredSettings,
          templates,
          areaCode: dataset.wardCode,
        }),
        // { autoSelect: !smDown }, // TODO: ここの挙動追う
      );
    });

    return () => {
      // TODO: クリーンアップ
    };
  }, [initialPlateauDatasets]);

  // データセットパネルのレイヤー群が変化したらクエパラを更新してARViewを再レンダリング
  let [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!rootLayers.length) { return; }
    const datasetIds = rootLayers.map(rootLayer => rootLayer.rawDataset.id);
    setSearchParams({id: datasetIds.join()});

    return () => {
      setSearchParams({});
    };
  }, [rootLayers]);

  // CDNからCesiumを読み込む
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  // const [, setCesiumLoadedAtom] = useAtom(cesiumLoadedAtom);
  useEffect(() => {
    // setCesiumLoadedAtom(false);
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js';
    script.async = true;
    script.onload = () => {
      setCesiumLoaded(true);
      // setCesiumLoadedAtom(true);
    }
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  // パッケージからCesiumを読込む場合は単にこれでOK
  // useEffect(() => {
  //   startAR();
  //   return () => stopAR();
  // }, []);

  // AR View 起動
  const [isARStarted, setIsARStarted] = useState(false);
  useEffect(() => {
    if (!cesiumLoaded || !initialTilesetUrls) { return; }
    startAR(initialTilesetUrls);
    setIsARStarted(true);

    return () => {
      stopAR();
      setIsARStarted(false);
    };
  }, [cesiumLoaded, initialTilesetUrls]);

  // UIのステート変更を監視してVMに反映
  const [compassBias] = useAtom(compassBiasAtom);
  const [fovPiOver] = useAtom(fovPiOverAtom);
  // const [selectedFeature, setSelectedFeature] = useAtom(selectedFeatureAtom);
  useEffect(() => {
    if (!isARStarted) { return; }
    console.log("compass bias (UI): ", compassBias);
    updateCompassBias(compassBias);
  }, [compassBias]);
  useEffect(() => {
    if (!isARStarted) { return; }
    console.log("fov pi over (UI): ", fovPiOver);
    updateFov(fovPiOver);
  }, [fovPiOver]);

  return (
    <div {...props}>
      <video
        id="device_camera_preview" 
        autoPlay muted playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      ></video>
      <div
        id="cesium_container"
        className="absolute top-0 left-0 w-full h-full"
      ></div>
      <div
        id="status_container"
        className="
          absolute 
          top-5 left-5 
          flex flex-col items-start gap-5 
          p-5 
          rounded-3xl
          text-white
          bg-black
          bg-opacity-50
          hidden
        "
      >
        <div id="geolocation_status"></div>
        <div id="absolute_orientation_status"></div>
        <input
          type="button"
          value="iOSのIMUを許可"
          id="ios_imu_permission_button"
        />
        
        <div id="ar_debug_toolbox">
          <table>
            <tbody>
              <tr>
                <td>Hide other Buildings</td>
                <td>
                  <input
                    type="checkbox"
                    data-bind="checked: shouldHideOtherBldgs"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
