import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { isNativeApp } from './platform';

export async function requestCameraPermission(): Promise<PermissionStatus | null> {
  if (!isNativeApp()) return null;
  return Camera.requestPermissions();
}

export async function capturePhotoAsDataUrl(): Promise<string | null> {
  if (!isNativeApp()) return null;

  const photo = await Camera.getPhoto({
    quality: 85,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera,
  });

  return photo.dataUrl ?? null;
}
