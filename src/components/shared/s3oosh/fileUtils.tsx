import { FileImage, File as FileIcon, AudioWaveform, Video, FolderArchive } from "lucide-react";
import { FileUploadProgress } from "./types";

enum FileTypes {
  Image = "image",
  Pdf = "pdf",
  Audio = "audio",
  Video = "video",
  Other = "other",
}

export const getFileIconAndColor = (file: File, thumbnails: Record<string, string>) => {
  if (file.type.includes(FileTypes.Image) && thumbnails[file.name]) {
    return {
      icon: (
        <picture>
        <img
          src={thumbnails[file.name]}
          alt={file.name}
          className="w-20 h-20 object-contain"
          width={20}
          height={20}
        />
        </picture>
      ),
      color: "",
    };
  }

  if (file.type.includes(FileTypes.Image)) {
    return {
      icon: <FileImage size={40} />,
    };
  }

  if (file.type.includes(FileTypes.Pdf)) {
    return {
      icon: <FileIcon size={40} />,
    };
  }

  if (file.type.includes(FileTypes.Audio)) {
    return {
      icon: <AudioWaveform size={40} />,
    };
  }

  if (file.type.includes(FileTypes.Video)) {
    return {
      icon: <Video size={40} />,
    };
  }

  return {
    icon: <FolderArchive size={40} />,
  };
};

export const generateThumbnails = (filesToUpload: File[]) => {
  const newThumbnails: Record<string, string> = {};

  filesToUpload.forEach((f) => {
    if (f.type.startsWith("image")) {
      const objectUrl = URL.createObjectURL(f as unknown as Blob);
      newThumbnails[f.name] = objectUrl;
    }
  });

  return newThumbnails;
};

export const revokeThumbnails = (thumbnails: Record<string, string>) => {
  Object.values(thumbnails).forEach((url) => URL.revokeObjectURL(url));
};


const S3_BUCKET_URL = "https://mondain-presigned-media.s3.us-east-2.amazonaws.com";

export const getFileUrl = (fileOrFileName: FileUploadProgress | string) => {
  let fileName: string;
  if (typeof fileOrFileName === 'string') {
    fileName = fileOrFileName;
  } else {
    fileName = fileOrFileName.newFileName || fileOrFileName.file.name;
  }
  
  // Ensure the fileName doesn't start with a slash
  if (fileName.startsWith('/')) {
    fileName = fileName.slice(1);
  }

  // Construct the full S3 URL
  const url = `${S3_BUCKET_URL}/${fileName}`;
  return url;
};