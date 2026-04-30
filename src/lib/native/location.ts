import { Geolocation } from '@capacitor/geolocation';
import { isNativeApp } from './platform';

export type NativeLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export async function requestLocationPermission(): Promise<boolean> {
  if (!isNativeApp()) return false;
  const permissions = await Geolocation.requestPermissions();
  return permissions.location === 'granted' || permissions.coarseLocation === 'granted';
}

export async function getCurrentNativeLocation(): Promise<NativeLocation | null> {
  if (!isNativeApp()) return null;

  const permissionOk = await requestLocationPermission();
  if (!permissionOk) return null;

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy ?? null,
  };
}
