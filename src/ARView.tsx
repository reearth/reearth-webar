import { useEffect } from "react";
import { startAR, stopAR, isios, isImuPermissionGranted, requestImuPermission } from "./ar";
import { useAtom } from "jotai";
import { FloatingButton } from "./components/prototypes/ui-components";
import { cesiumLoadedAtom, arStartedAtom } from "./components/prototypes/view/states/ar";

export default function ARView({...props}) {
  // CDNからCesiumを読み込む
  // AR起動
  const [cesiumLoaded, setCesiumLoaded] = useAtom(cesiumLoadedAtom);
  const [arStarted, setArStarted] = useAtom(arStartedAtom);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js';
    script.async = true;
    script.onload = () => {
      setCesiumLoaded(true);
      startAR();
      setArStarted(true);
    }
    document.body.appendChild(script);

    return () => {
      stopAR();
      setArStarted(false);
      document.body.removeChild(script);
      setCesiumLoaded(false);
    };
  }, []);

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
      {isios && !isImuPermissionGranted &&
        // <div className="absolute top-2 right-2">
        //   <input type="button" value="iOSのジャイロセンサを許可" onClick={requestImuPermission} />
        // </div>
        <div className="absolute top-2 right-2">
          <FloatingButton onClick={requestImuPermission}>
            iOSのジャイロセンサを許可
          </FloatingButton>
        </div>
      }
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
