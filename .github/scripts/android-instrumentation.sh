#!/usr/bin/env bash
set -euo pipefail

ready=0
for attempt in $(seq 1 180); do
  booted="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  package_service="$(adb shell service check package 2>/dev/null || true)"
  activity_service="$(adb shell service check activity 2>/dev/null || true)"
  if [[ "$booted" == "1" ]] && grep -q "found" <<<"$package_service" && grep -q "found" <<<"$activity_service"; then
    if adb shell cmd package list packages >/dev/null 2>&1 && adb shell cmd activity get-config >/dev/null 2>&1; then
      ready=1
      break
    fi
  fi
  sleep 2
done

if [[ "$ready" -ne 1 ]]; then
  echo "::error::Android package/activity services did not become stable within 360 seconds."
  adb shell service list | grep -E "package|activity" || true
  adb logcat -d -t 1000 || true
  exit 1
fi

sleep 10
adb shell cmd package list packages >/dev/null
adb shell cmd activity get-config >/dev/null
adb shell settings put global window_animation_scale 0
adb shell settings put global transition_animation_scale 0
adb shell settings put global animator_duration_scale 0
gradle --no-daemon -p native-android connectedDebugAndroidTest
