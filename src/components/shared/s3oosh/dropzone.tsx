"use client";

import axios, { AxiosProgressEvent, CancelTokenSource } from "axios";
import { Ref, useCallback, useEffect, useState } from "react";
import { useDropzone } from "../dropzone/react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPreSignedUrl } from "./_actions/getPreSignedUrl";
import { FileUploadProgress, FileStatus } from "./types";
import { generateThumbnails, getFileUrl, revokeThumbnails } from "./fileUtils";
import FileCard from "./file-card";
import { HardDriveUploadIcon } from "lucide-react";

interface DropzoneComponentProps {
  maxTotalFiles: number;
  maxSize: number;
  acceptedFileTypes: {
    [key: string]: string[];
  };
  filesToUpload: FileUploadProgress[];
  setFilesToUpload: React.Dispatch<React.SetStateAction<FileUploadProgress[]>>;
  uploadUrls: Record<string, string>;
  setUploadUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  onUploadProgress: (
    progressEvent: AxiosProgressEvent,
    file: File,
    cancelSource: CancelTokenSource,
    fileStatus: FileStatus
  ) => void;
  removeFile: (file: File) => void;
  dirInBucket: string | null; 
  onUploadComplete?: (urls: string[]) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  maxTotalFiles,
  maxSize,
  acceptedFileTypes,
  filesToUpload,
  setFilesToUpload,
  setUploadUrls,
  onUploadComplete,
  errorMessage,
  setErrorMessage,
  onUploadProgress,
  removeFile,
  dirInBucket,
}) => {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [permanentUrls, setPermanentUrls] = useState<string[]>([]);

  useEffect(() => {
    if (onUploadComplete && permanentUrls.length > 0) {
      onUploadComplete(permanentUrls);
    }
  }, [permanentUrls, onUploadComplete]);


  useEffect(() => {
    const newThumbnails = generateThumbnails(filesToUpload.map((f) => f.file));
    setThumbnails(newThumbnails);

    return () => {
      revokeThumbnails(newThumbnails);
    };
  }, [filesToUpload]);


  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setErrorMessage("");
      if (
        !maxTotalFiles ||
        filesToUpload.length + acceptedFiles.length > maxTotalFiles
      ) {
        setErrorMessage(
          `You can only upload a maximum of ${maxTotalFiles} files.`
        );
        return;
      }
      const fileUploadBatch = acceptedFiles.map(async (file) => {
        try {
          const presignedUrlResponse = await getPreSignedUrl(
            file.name,
            file.type,
            dirInBucket
          );
          const { url: presignedUrl, newFileName } = presignedUrlResponse;

          setUploadUrls((prevUrls) => ({
            ...prevUrls,
            [newFileName]: presignedUrl,
          }));

          const source = axios.CancelToken.source();
          setFilesToUpload((prev) => [
            ...prev,
            { progress: 0, file, source, status: FileStatus.Uploading },
          ]);

          await axios.put(presignedUrl, file, {
            headers: { "Content-Type": file.type },
            cancelToken: source.token,
            onUploadProgress: (progressEvent: AxiosProgressEvent) =>
              onUploadProgress(
                progressEvent,
                file,
                source,
                FileStatus.Uploading
              ),
          });

          const permanentUrl = await getFileUrl(newFileName);
          console.log("Permanent URL:", permanentUrl);

          setPermanentUrls((prev) => [...prev, permanentUrl]);


          setFilesToUpload((prevUploadProgress) =>
            prevUploadProgress.map((item) =>
              item.file.name === file.name
                ? { ...item, status: FileStatus.Uploaded, newFileName, permanentUrl }
                : item
            )
          );
        } catch (error) {
          console.error("Error uploading file:", file.name, error);
          setFilesToUpload((prevUploadProgress) =>
            prevUploadProgress.map((item) =>
              item.file.name === file.name
                ? { ...item, status: FileStatus.Error, error: error }
                : item
            )
          );
        }
      });

      try {
        await Promise.all(fileUploadBatch);
      } catch (error) {
        console.error("Error uploading files:", error);
      }
      setErrorMessage("");
    },
    [setErrorMessage, maxTotalFiles, filesToUpload.length, dirInBucket, setUploadUrls, setFilesToUpload, onUploadProgress]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxSize,
  });

  const inputProps = getInputProps() as React.InputHTMLAttributes<HTMLInputElement> & { ref: Ref<HTMLInputElement> };


  return (
    <div className="max-w-lg mx-auto mt-8">
    <div className="flex flex-col items-center justify-center p-4 md:p-8 border border-gray-200 rounded-lg shadow-md bg-gray-100 hover:bg-gray-200 transition duration-300" {...getRootProps()}>
      <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4">
        <HardDriveUploadIcon size={24} className="text-gray-500 md:text-xl" />
        <p className="text-base md:text-lg font-semibold text-gray-800">Drag & Drop Files Here</p>
        <p className="text-xs md:text-sm text-gray-600">or click to browse</p>
      </div>
      <Input {...inputProps} className="hidden" />
      {errorMessage && <div className="mt-2 md:mt-4 text-xs md:text-sm text-red-600">{errorMessage}</div>}
      {filesToUpload.length > 0 && (
        <div className="mt-4 w-full">
          <ScrollArea className="max-h-64 md:max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
              {filesToUpload.map((fileUploadProgress, index) => (
                <FileCard
                  key={index}
                  fileUploadProgress={fileUploadProgress}
                  thumbnails={thumbnails}
                  getFileUrl={getFileUrl}
                  removeFile={removeFile}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  </div>
  );
  
};

export default DropzoneComponent;
