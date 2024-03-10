
import { useEffect, useMemo, useState } from "react";
import { startAR, stopAR, resetTileset, updateCompassBias, updateFov, pickUpFeature } from "./ar";
import { useAtom, useAtomValue } from "jotai";
import { useSearchParams } from "react-router-dom";
import queryString from "query-string";
import { useDatasetById, useDatasetsByIds } from "./components/shared/graphql";
import { PlateauDataset, PlateauDatasetItem } from "./components/shared/graphql/types/catalog";
import { rootLayersAtom } from "./components/shared/states/rootLayer";
import { compassBiasAtom, fovPiOverAtom } from "./components/prototypes/view/states/ar";

function tilesetUrls(plateauDatasets: [PlateauDataset]): string[] {
  return plateauDatasets.map(plateauDataset => {
    const plateauDatasetItems = plateauDataset.items as [PlateauDatasetItem];
    // LOD2(テクスチャあり)->LOD2(テクスチャなし)->LOD1の順でフォールバック
    const tilesetUrlLod2Tex = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "TEXTURE").url
    if (tilesetUrlLod2Tex) {
      // console.log("LOD2 with Texture Tileset Exists: ", tilesetUrlLod2Tex);
      return tilesetUrlLod2Tex;
    } else {
      const tilesetUrlLod2NoneTex = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "NONE").url
      if (tilesetUrlLod2NoneTex) {
        // console.log("LOD2 with No Texture Tileset Exists: ", tilesetUrlLod2NoneTex);
        return tilesetUrlLod2NoneTex;
      } else {
        const tilesetUrlLod1 = plateauDatasetItems.find(({ lod }) => lod == 1).url
        if (tilesetUrlLod1) {
          // console.log("LOD1 Tileset Exists: ", tilesetUrlLod1);
          return tilesetUrlLod1;
        } else {
          return null;
        }
      }
    }
  });
}

export default function ARView({...props}) {
  // TODO: View3.0からdatasetが全く選択されない状態でもAR Viewは起動できるので、ARView側でもデータセット検索機能は必要なのでパネルのフル機能で実装する
  // 一旦はURLからの表示と検索が動けばSTG出せる。データセットパネルの中での詳細なモデルのプロパティ操作にも追って対応必要
  // AR View 側でデータセットを変更した際に、リロードしてもそれが再現できるようにURLのクエパラもAR View側で書き換える機能は Nice to Have

  // 開始時にクエパラでデータセットIDを指定された場合にARViewの初期化に使用するtilesetURL (レンダリング毎に忘却したいのでStateにはしない)
  let initialTilesetUrls: string[];
  // クエパラを見てPLATEAU ViewからのデータセットID群の初期値が来ていれば取得し、tilesetURL群に変換
  const searchQueryParams = queryString.parse(location.search, {arrayFormat: 'comma'});
  let initialDatasetIds = searchQueryParams.id ?? [];
  if (typeof initialDatasetIds === 'string') { initialDatasetIds = [initialDatasetIds]; }
  // フックの数を変えないためにもしクエパラがundefinedでも空配列で必ずクエリを呼び出す
  const { data } = useDatasetsByIds(initialDatasetIds);
  if (data) {
    const initialPlateauDatasets = data.nodes as [PlateauDataset];
    // useDatasetsByIdsクエリが中身のあるデータを返してくるまでは待機
    if (initialPlateauDatasets) {
      initialTilesetUrls = tilesetUrls(initialPlateauDatasets);
      console.log(initialTilesetUrls);
    }
  }

  // 選択したCesium上のオブジェクトのステート
  const [selectedFeature, setSelectedFeature] = useState(null);
  // CDNからCesiumを読み込むバージョン
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js';
    script.async = true;
    script.onload = () => setCesiumLoaded(true);
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

    // ar.jsからFeatureをクリックした際のpropertiesを取得
    const handlePickedFeature = (pickedFeature) => {
      console.log('pickedFeature updated:', pickedFeature);
      setSelectedFeature(pickedFeature);
    };
    pickUpFeature(handlePickedFeature);

    if (!cesiumLoaded || !initialTilesetUrls) { return; }
    startAR(initialTilesetUrls);
    setIsARStarted(true);
  
    return () => {
      stopAR();
      setIsARStarted(false);
    };
  }, [cesiumLoaded, initialTilesetUrls]);

  // データセットパネルに追加されたレイヤー群
  const rootLayers = useAtomValue(rootLayersAtom);
  // クエパラの逆セットに使用
  let [searchParams, setSearchParams] = useSearchParams();
  // データセットパネルのレイヤー群が変化したらクエパラを更新してARViewを再レンダリング
  useEffect(() => {
    if (!rootLayers.length) { return; }
    const datasetIds = rootLayers.map(rootLayer => rootLayer.rawDataset.id);
    setSearchParams({id: datasetIds.join()});
  }, [rootLayers]);

  // UIのステート変更を監視してVMに反映
  const [compassBias] = useAtom(compassBiasAtom);
  const [fovPiOver] = useAtom(fovPiOverAtom);
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
