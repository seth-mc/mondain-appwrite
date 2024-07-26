"use client";

import { AxiosProgressEvent, CancelTokenSource } from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import DropzoneComponent from "./dropzone";

enum FileStatus {
  Uploading = "uploading",
  Uploaded = "uploaded",
  Error = "error",
}

interface FileUploadProgress {
  error?: Error | undefined | unknown | null;
  progress: number;
  file: File;
  source: CancelTokenSource | null;
  status: FileStatus;
  newFileName?: string;
}

export interface S3ooshConfig {
  maxTotalFiles: number;
  maxSize: number;
  acceptedFileTypes: {
    [key: string]: string[];
  };
}

interface S3ooshProps {
  config: {
    maxTotalFiles: number;
    maxSize: number;
    acceptedFileTypes: Record<string, string[]>;
  };
  dirInBucket?: string | null;
  onUploadComplete: (urls: string[]) => void;
  initialUrls?: string[];
}


export default function S3oosh({ config, dirInBucket = null, onUploadComplete, initialUrls = [] }: S3ooshProps) {
  const { maxTotalFiles, maxSize, acceptedFileTypes } = config;
  const [filesToUpload, setFilesToUpload] = useState<FileUploadProgress[]>([]);
  const [uploadUrls, setUploadUrls] = useState<Record<string, string>>(() => {
    const initialUploadUrls: Record<string, string> = {};
    initialUrls.forEach((url, index) => {
      initialUploadUrls[`initial-file-${index}`] = url;
    });
    return initialUploadUrls;
  });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const prevUploadUrlsRef = useRef<Record<string, string>>({});

  const handleUploadComplete = useCallback((urls: string[]) => {
    onUploadComplete(urls);
  }, [onUploadComplete]);
  
  const memoizedOnUploadComplete = useCallback((urls: string[]) => {
    onUploadComplete(urls);
  }, [onUploadComplete]);

  useEffect(() => {
    const currentUploadUrls = JSON.stringify(uploadUrls);
    const prevUploadUrls = JSON.stringify(prevUploadUrlsRef.current);

    if (currentUploadUrls !== prevUploadUrls) {
      const urls = Object.values(uploadUrls);
      memoizedOnUploadComplete(urls);
      prevUploadUrlsRef.current = uploadUrls;
    }
  }, [uploadUrls, memoizedOnUploadComplete]);

  const onUploadProgress = useCallback((
    progressEvent: AxiosProgressEvent,
    file: File,
    cancelSource: CancelTokenSource,
    fileStatus: FileStatus
  ) => {
    const progress = Math.round(
      (progressEvent.loaded / (progressEvent.total ?? 1)) * 100
    );

    setFilesToUpload((prevUploadProgress) =>
      prevUploadProgress.map((item) =>
        item.file.name === file.name
          ? { ...item, progress, source: cancelSource, status: fileStatus }
          : item
      )
    );
    if (progress === 100) {
      setFilesToUpload((prevUploadProgress) =>
        prevUploadProgress.map((item) =>
          item.file.name === file.name
            ? { ...item, status: FileStatus.Uploaded }
            : item
        )
      );
    }
  }, []);

  const removeFile = useCallback((file: File) => {
    setFilesToUpload((prevUploadProgress) => {
      const updatedUploadProgress = prevUploadProgress.map((item) =>
        item.file === file && item.status !== FileStatus.Uploading
          ? { ...item, status: FileStatus.Error }
          : item
      );
      return updatedUploadProgress.filter((item) => item.file !== file);
    });

    setUploadUrls((prevUrls) => {
      const newUrls = { ...prevUrls };
      delete newUrls[file.name];
      return newUrls;
    });
  }, []);

  return (
    <DropzoneComponent
      maxTotalFiles={maxTotalFiles}
      maxSize={maxSize}
      acceptedFileTypes={acceptedFileTypes}
      filesToUpload={filesToUpload}
      setFilesToUpload={setFilesToUpload}
      uploadUrls={uploadUrls}
      setUploadUrls={setUploadUrls}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
      onUploadProgress={onUploadProgress}
      removeFile={removeFile}
      dirInBucket={dirInBucket}
      onUploadComplete={handleUploadComplete}
    />
  );
}