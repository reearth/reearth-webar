import { useEffect, useState } from "react";
import { startAR, stopAR, updateCompassBias, updateFov } from "./ar";
import { useAtom } from "jotai";
import { compassBiasAtom, fovPiOverAtom } from "./components/prototypes/view/states/ar";
import { useDatasetById } from "./components/shared/graphql";
import { PlateauDatasetItem } from "./components/shared/graphql/types/catalog";
import queryString from "query-string";

export default function ARView({...props}) {
  const [cesiumLoaded, setCesiumLoaded] = useState(false);
  const [isARStarted, setIsARStarted] = useState(false);

  // CDNからCesiumを読み込むバージョン
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
  // TODO: ARView起動時にPLATEAU View側からidをもってくる (どういうかたちで渡ってくるか確定してほしい→ URLのクエパラからとる↓)
  // TODO: useParamsでURLのクエパラからデータセットIDを取る (県境等が判断できないのでViewから複数のid渡ってくる場合もあるため、のちほど複数IDに対応したuseDatasetsByIdを使う)
  // → id="カンマ区切りで複数" で来る
  const searchQueryParams = queryString.parse(location.search, {arrayFormat: 'comma'});
  console.log(searchQueryParams);
  const { data } = useDatasetById("d_13103_bldg");
  useEffect(() => {
    if (!cesiumLoaded || !data?.node) { return; }
    const plateauDataset = data.node;
    const plateauDatasetItems = plateauDataset.items as [PlateauDatasetItem];
    // LOD2(テクスチャあり)->LOD2(テクスチャなし)->LOD1の順でフォールバック
    const tilesetUrlLod2Tex = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "TEXTURE").url
    if (tilesetUrlLod2Tex) {
      console.log("LOD2 with Texture Tileset Exists: ", tilesetUrlLod2Tex);
      startAR(tilesetUrlLod2Tex);
      setIsARStarted(true);
    } else {
      const tilesetUrlLod2NoneTex = plateauDatasetItems.find(({ lod, texture }) => lod == 2 && texture == "NONE").url
      if (tilesetUrlLod2NoneTex) {
        console.log("LOD2 with No Texture Tileset Exists: ", tilesetUrlLod2NoneTex);
        startAR(tilesetUrlLod2NoneTex);
        setIsARStarted(true);
      } else {
        const tilesetUrlLod1 = plateauDatasetItems.find(({ lod }) => lod == 1).url
        if (tilesetUrlLod1) {
          console.log("LOD1 Tileset Exists: ", tilesetUrlLod1);
          startAR(tilesetUrlLod1);
          setIsARStarted(true);
        }
      }
    }
    return () => {
      stopAR();
      setIsARStarted(false);
    };
  }, [cesiumLoaded, data]);

  // TODO: View3.0からdatasetが全く選択されない状態でもAR Viewは起動できるので、ARView側でもデータセット検索機能は必要なのでパネルのフル機能で実装する
  // 一旦はURLからの表示と検索が動けばSTG出せる。データセットパネルの中での詳細なモデルのプロパティ操作にも追って対応必要
  // AR View 側でデータセットを変更した際に、リロードしてもそれが再現できるようにURLのクエパラもAR View側で書き換える機能は Nice to Have

  // UIのステートを取得
  const [compassBias] = useAtom(compassBiasAtom);
  const [fovPiOver] = useAtom(fovPiOverAtom);
  // UIのステート変更を監視してVMに反映
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
