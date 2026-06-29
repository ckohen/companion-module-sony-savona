## Sony Savona

Control Sony cameras that expose Sony's network remote-control API.

This module is expected to work with cameras that use the same remote API as
Sony Content Browser Mobile. The following devices are tested or known working:

- PXW-Z190V

## Camera Setup

The camera must be connected to the same network as Companion.

Enable camera remote control in the camera's network menu. The exact menu path
depends on the active network mode, but the setting is under the network menu
for the active interface, such as Station or Wired LAN.

Camera remote control may be disabled by default.

The username and password can be viewed or changed on the camera under:

`Network` -> `Access Authentication`

## Companion Configuration

- `Target IP`: IP address of the camera.
- `Port`: Camera HTTP port. The default is `80`.
- `Username`: Camera access authentication username.
- `Password`: Camera access authentication password.
- `Subscribe to Feedbacks`: Keep enabled for normal use. This subscribes to
  camera notifications so feedbacks and variables can track live camera state.
- `Show Audio Variables`: Adds audio level variables. Audio data updates very
  frequently, so leave this disabled unless you need it.

Actions still work when `Subscribe to Feedbacks` is disabled. The module also
fetches the values needed for action option choices when it connects. However,
camera state will not continue to refresh, so feedbacks and variables may become
stale. Disabling notifications is mainly useful for send-and-forget workflows or
troubleshooting.

## Actions

The module includes actions for common camera control:

- Recording: open recorder, start recording, stop recording.
- Media: upload a clip, upload the latest recording, delete proxy clips.
- Upload settings and jobs: choose the default upload setting, abort/restart/delete
  upload jobs, and clear completed upload jobs.
- Lens and exposure: zoom, focus, iris, gain, ND, shutter, and gamma.
- White balance: mode, value, tracking mode, and execute white balance.
- Camera utilities: color bars, auto upload, and assignable button press.

Most actions are intended to be direct camera commands. If an action fails, check
the Companion log for the camera response or module error.

## Upload Notes

The camera appears to support automatic upload for proxy recording, but not main
recording.

`Upload Latest Recording` uploads the latest completed main recording. The camera
reports the next clip name, or possibly the active clip name while recording, so
the module derives the previous completed clip when the camera is not actively
recording.

Proxy clip names are not reported by that camera method, so `Upload Latest Recording`
does not upload proxy clips.

The `Stop Recording and Upload Latest` preset includes a delay before uploading
to give the camera time to finalize the recording. The required delay may vary by
camera, media, and recording format.

## Feedbacks and Variables

Feedbacks and variables use the camera state cached by the module. With
notifications enabled, the module updates this cache when the camera reports
changes. The module also refreshes startup data when it connects.

Useful dedicated feedbacks include:

- Recording state
- Upload job state
- Media card state
- System alert active
- Remote control allowed
- Auto upload enabled

There is also a generic state-matching feedback for checking other cached state.

Variables expose camera state such as recording status, clip information, media
card status, battery information, remote-control permission, upload state, and
selected camera settings. Audio level variables are optional because they update
frequently.

## Presets

The module includes presets for:

- Start recording
- Stop recording
- Stop recording and upload latest recording
- Upload latest recording
- Enable or disable auto upload
- Abort, restart, or clear upload jobs
- Common status indicators

Presets use the camera's current default upload setting when available. If the
camera is not connected, they use a fallback upload setting value that can be
edited after adding the preset.

## Troubleshooting

If Companion cannot connect:

- Confirm the camera is on the network and reachable from the Companion computer.
- Confirm camera remote control is enabled for the active network interface.
- Confirm the IP address and port.
- Confirm the username and password in `Network` -> `Access Authentication`.

If feedbacks or variables do not update:

- Leave `Subscribe to Feedbacks` enabled.
- Reconnect the module after changing notification-related camera settings.
- Confirm remote control is still allowed by the camera.

If uploads fail:

- Confirm the selected upload setting exists on the camera.
- Confirm the selected media card contains the clip.
- For latest-recording uploads, wait long enough for the camera to finish finalizing
  the recording.
- Use explicit clip upload if you need to upload a known clip name.
