import { useEffect, useRef, useState } from "react";
import { startAR, stopAR, isios, isImuPermissionGranted, requestImuPermission, updateFov, updateCompassBias } from "./ar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import PopupDialog from "./components/prototypes/ui-components/PopupDialog";
import { cesiumLoadedAtom, arStartedAtom, fovPiOverAtom, compassBiasAtom } from "./components/prototypes/view/states/ar";

export default function ARView({...props}) {
  // CDNからCesiumを読み込む
  const [cesiumLoaded, setCesiumLoaded] = useAtom(cesiumLoadedAtom);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js';
    script.async = true;
    script.onload = () => {
      setCesiumLoaded(true);
    }
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      setCesiumLoaded(false);
    };
  }, []);

  const setArStarted = useSetAtom(arStartedAtom);
  const compassBias = useAtomValue(compassBiasAtom);
  const fovPiOver = useAtomValue(fovPiOverAtom);
  useEffect(() => {
    if (!cesiumLoaded) { return; }
    startAR();
    setArStarted(true);
    updateCompassBias(compassBias);
    updateFov(fovPiOver);

    return () => {
      stopAR();
      setArStarted(false);
    };
  }, [cesiumLoaded]);

  // Reactでvideoタグのmutedが除去されてしまう古来からのバグへのワークアラウンド
  const videoRef = useRef(null);
  useEffect(() => {
      videoRef.current.autoPlay = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.playsInline = true;
  })

  const [isIMUPermitted, setIMUPermit] = useState<boolean>(false);
  const handleClickIMURequest = () => {
    requestImuPermission();
    setIMUPermit(true);
  }
  const [isOpenDeniedPopup, toggleOpenDeniedPopup] = useState<boolean>(false);
  const handleCloseDeniedPopup = () => {
    toggleOpenDeniedPopup(true);
  }

  return (
    <div {...props}>
      <video
        id="device_camera_preview"
        ref={videoRef}
        autoPlay={true} muted={true} playsInline={true}
        className="absolute top-0 left-0 w-full h-full object-cover"
      ></video>
      <div
        id="cesium_container"
        className="absolute top-0 left-0 w-full h-full"
      ></div>
      {isios && isImuPermissionGranted === null &&
        <PopupDialog onClose={handleClickIMURequest} open={!isIMUPermitted} content="iOSのジャイロセンサを許可します"/>
      }
      {isios && isImuPermissionGranted === "denied" && <PopupDialog onClose={handleCloseDeniedPopup} open={!isOpenDeniedPopup} content={"ジャイロセンサが許可されていません、ブラウザの設定から許可してください。"}/>}
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
