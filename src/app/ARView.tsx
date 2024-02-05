import React, { useEffect } from "react";
import { startAR, stopAR, updateCompassBias, updateFov } from "./ar";
import { useAtom } from "jotai";
import { compassBiasAtom, fovPiOverAtom } from "./components/prototypes/view/states/ar";

export default function ARView({...props}) {
  useEffect(() => {
    // TODO: Viewerのセットアップコードは最後まで走っているが、画面に表示されないので調査する (Cesiumをnpmで入れるようにしてから。以前CDNの場合は大丈夫だった)
    startAR();
    return () => stopAR();
  }, []);

  // UIのステートを取得
  // TODO: 一旦atomWithStorageを使ってリロードを跨いで値を永続化しているが、リセットされた方がよいかどうか検討する
  const [compassBias] = useAtom(compassBiasAtom);
  const [fovPiOver] = useAtom(fovPiOverAtom);

  // UIのステート変更を監視してVMに反映
  useEffect(() => {
    console.log("compass bias (UI): ", compassBias);
    updateCompassBias(compassBias);
  }, [compassBias]);

  useEffect(() => {
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
