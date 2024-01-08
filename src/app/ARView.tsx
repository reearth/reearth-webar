import Script from "next/script"
import React from "react"

export default function ARView() {
  return (
    <div>
      <video id="device_camera_preview" autoPlay muted playsInline></video>
      <div id="cesium_container"></div>
      <div id="status_container">
        <div id="geolocation_status"></div>
        <div id="absolute_orientation_status"></div>
        <input type="button" value="iOSのIMUを許可" id="ios_imu_permission_button" />
        <div id="toolbox">
          <table>
            <tbody>
              <tr>
                <td>
                  Hide other Bldgs
                </td>
                <td>
                  <input type="checkbox" data-bind="checked: shouldHideOtherBldgs" />
                </td>
              </tr>
              <tr>
                <td>
                  FOV (PI over ~)
                </td>
                <td>
                  <input type="range" min="1" max="10" step="0.1" data-bind="value: fovPiOver, valueUpdate: 'input'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
