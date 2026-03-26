import { FileUploadProgress, FileStatus } from "./types";
import { getFileIconAndColor } from "./fileUtils";
import { Progress } from "@/components/ui/progress";
import { Link, X, GripVertical } from "lucide-react";
import type { DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";

interface FileCardProps {
  fileUploadProgress: FileUploadProgress;
  thumbnails: Record<string, string>;
  getFileUrl: (file: FileUploadProgress) => string;
  removeFile: (file: File) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  draggableProps?: DraggableProvidedDraggableProps;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const FileCard: React.FC<FileCardProps> = ({
  fileUploadProgress,
  thumbnails,
  getFileUrl,
  removeFile,
  innerRef,
  draggableProps,
  dragHandleProps,
}) => {
  return (
    <div 
      className="relative group flex flex-col items-center w-full"
      ref={innerRef}
      {...draggableProps}
    >
    <div className="w-full h-16 sm:h-20 lg:h-24 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden relative" {...dragHandleProps}>
      {dragHandleProps && (
        <div className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing z-10">
          <GripVertical size={16} />
        </div>
      )}
      {fileUploadProgress.status === FileStatus.Uploaded && fileUploadProgress.newFileName && (
        <a href={getFileUrl(fileUploadProgress)} target="_blank" rel="noopener noreferrer" className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 z-10" onClick={(e) => e.stopPropagation()}>
          <Link size={12} />
        </a>
      )}
      {getFileIconAndColor(fileUploadProgress.file, thumbnails).icon}
    </div>
    <p className="mt-1 md:mt-2 text-gray-800 text-xs sm:text-sm font-medium truncate w-full text-center" title={fileUploadProgress.file.name}>
      {fileUploadProgress.file.name.length > 15 ? fileUploadProgress.file.name.slice(0, 15) + "..." : fileUploadProgress.file.name}
    </p>
    <div className="w-full h-1 mt-1 md:mt-2">
      {(fileUploadProgress.status === FileStatus.Uploading && !fileUploadProgress.newFileName) && (
        <Progress value={fileUploadProgress.progress} className="w-full h-full" />
      )}
    </div>
    {fileUploadProgress.status === FileStatus.Error && (
      <p className="text-red-500 text-xs md:text-sm mt-1 md:mt-2 text-center">{String(fileUploadProgress.error)}</p>
    )}
    <button onClick={(e) => { e.stopPropagation(); if (fileUploadProgress.source) fileUploadProgress.source.cancel("Upload cancelled"); removeFile(fileUploadProgress.file); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
      <X size={16} />
    </button>
  </div>
  );
};

export default FileCard;
