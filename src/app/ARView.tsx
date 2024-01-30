"use client";

import React, { useEffect } from "react";
import { ar } from "./ar";

export default function ARView({...props}) {
  // TODO: jsの時のままKnockoutを使うとapplyBindingsが2回呼ばれるエラーが発生するなど相性が良くないうえに意味もないので、ar.js側でバインディングしたい変数をexportして、ARViewでjotaiのatomをuseEffectで監視してar.js側の変数を更新してあげるのがよさそう
  // TODO: また、CDNではなくnpmからCesiumを使用すると、ローカル開発では Not allowed to load local resource になる問題もあるので、View3.0ではどうしているか確認する
  useEffect(() => {
    ar();
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
              <tr>
                <td>FOV (PI over ~)</td>
                <td>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.1"
                    data-bind="value: fovPiOver, valueUpdate: 'input'"
                  />
                </td>
              </tr>
              <tr>
                <td>Compass Bias (Degree)</td>
                <td>
                  <input 
                    type="range" 
                    min="-180" 
                    max="180" 
                    step="1" 
                    data-bind="value: compassBias, valueUpdate: 'input'"
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
