import { Device } from '@capacitor/device';
import { isNativeApp } from './platform';

export type NativeDeviceSnapshot = {
  model: string;
  osVersion: string;
  platform: string;
  appId: string;
  batteryLevel: number | null;
  isCharging: boolean | null;
};

export async function getNativeDeviceSnapshot(): Promise<NativeDeviceSnapshot | null> {
  if (!isNativeApp()) return null;

  const [info, appInfo, battery] = await Promise.all([
    Device.getInfo(),
    Device.getId(),
    Device.getBatteryInfo(),
  ]);

  return {
    model: info.model ?? 'unknown',
    osVersion: info.osVersion ?? 'unknown',
    platform: info.platform ?? 'web',
    appId: appInfo.identifier ?? 'unknown',
    batteryLevel: battery.batteryLevel ?? null,
    isCharging: battery.isCharging ?? null,
  };
}
