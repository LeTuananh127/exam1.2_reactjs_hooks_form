export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 5,242,880 bytes

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'] as const;

export const TARGET_CROP_SIZE = {
  width: 400,
  height: 400,
} as const;

export interface ImageCropFormValues {
  croppedImage: File | null;
}

export interface CroppedImageMetadata {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  originalFileName: string;
}
