import { CancelTokenSource } from "axios";

export enum FileStatus {
  Uploading = "uploading",
  Uploaded = "uploaded",
  Error = "error",
}

export enum FileTypes {
  Image = "image",
  Video = "video",
  Gif = "gif",
}

export interface FileUploadProgress {
  error?: Error | undefined | unknown | null;
  progress: number;
  file: File;
  source: CancelTokenSource | null;
  status: FileStatus;
  newFileName?: string;
  isVideo?: boolean;
  thumbnailUrl?: string;
  permanentUrl?: string;
}