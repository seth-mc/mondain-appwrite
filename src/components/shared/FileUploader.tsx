import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import Upscaler from "upscaler";


type FileUploaderProps = {
    fieldChange: (assets: uploadAsset[]) => void;
    mediaUrls: string[];
};

type uploadAsset = {
    url: string;
    file: File;
    type: string;
    thumbnail?: File;
}

const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1]; // Add null check
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const blobToFile = (blob: Blob, filename: string): File => {
    return new File([blob], filename, { type: blob.type, lastModified: Date.now() });
}

const FileUploader = ({ fieldChange }: FileUploaderProps) => {
    const [uploadAssets, setuploadAssets] = useState<uploadAsset[]>([]);


    const processImage = useCallback(async (file: File): Promise<File> => {
        let processedFile: File = file;

        // Upscale if necessary
        if (file.size < 100 * 1024) {
            const upscaler = new Upscaler();
            const imageSrc = URL.createObjectURL(file);
            const upscaledImageSrc = await upscaler.upscale(imageSrc);
            const upscaledImageBlob = await fetch(upscaledImageSrc).then(res => res.blob());
            processedFile = new File([upscaledImageBlob], file.name, { type: file.type });
        }

        // Assume targetWidth and targetHeight
        let targetWidth = 400;
        let targetHeight = 500;
        const image = new Image();
        image.src = URL.createObjectURL(processedFile);

        await new Promise<void>((resolve) => {
            image.onload = () => {
                if (image.width / image.height > 1) {
                    [targetWidth, targetHeight] = [targetHeight, targetWidth];
                }
                resolve();
            };
        });

        return processedFile;
    }, []);



    const processVideo = useCallback(async (file: File) => {
        return new Promise<{ video: File, thumbnail: File }>((resolve, reject) => {
            
            const reader = new FileReader();
            reader.onabort = () => reject(new Error('file reading was aborted'));
            reader.onerror = () => reject(new Error('file reading has failed'));
            reader.onload = () => {
                const binaryStr = reader.result;
                const blob = new Blob([new Uint8Array(binaryStr as ArrayBuffer)], { type: file.type });
                const videoFile = new File([blob], file.name, { type: file.type });

                const video = document.createElement('video');
                video.src = URL.createObjectURL(videoFile);
                video.preload = 'metadata';

                video.addEventListener('loadedmetadata', () => {
                    const middleTime = video.duration / 2;
                    video.currentTime = middleTime;

                    video.addEventListener('seeked', () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        canvas.getContext('2d')?.drawImage(video, 0, 0);

                        const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
                        const thumbnailFile = blobToFile(dataURLtoBlob(thumbnailDataUrl), 'thumbnail.jpg');

                        resolve({ video: videoFile, thumbnail: thumbnailFile });
                    });

                    setTimeout(() => {
                        reject(new Error('Failed to seek to the middle of the video'));
                    }, 5000);
                });

                setTimeout(() => {
                    reject(new Error('Failed to load video metadata'));
                }, 5000);
            }
            reader.readAsArrayBuffer(file);
        });
    }, []);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            acceptedFiles.forEach(async (file) => {
                if (file.type.startsWith('image/')) {
                    try {
                        const processedFile = await processImage(file);
                        const url = URL.createObjectURL(processedFile);
                        setuploadAssets(prev => [...prev, { url, file: processedFile, type: file.type }]);
                    } catch (error) {
                        console.error("Error processing file:", error);
                    }
                } else if (file.type.startsWith('video/')) {
                    try {
                        const { video, thumbnail } = await processVideo(file);
                        const url = URL.createObjectURL(video);
                        console.log('thumbnail', thumbnail)
                        setuploadAssets(prev => [...prev, { url, thumbnail, file: video, type: file.type }]);
                    } catch (error) {
                        console.error("Error processing video file:", error);
                    }
                }
            });
        },
        [] // Add an empty array as the second argument
    );

    // Use useEffect to update the parent state when imageAssets changes
    useEffect(() => {
        const files = uploadAssets.map(asset => asset.file);
        const uploadAssetFiles = files.map(file => ({ url: '', file, type: file.type }));
        fieldChange(uploadAssetFiles);
    }, [uploadAssets, fieldChange]);


    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpeg", ".jpg", ".svg", ".gif", ".tiff"],
            "video/*": [".mp4", ".mov", ".avi", ".flv", ".mkv"],
        },
    });

    return (
        <div className="flex lg:flex-row flex-col justify-center items-center bg-light-1 lg:p-5 p-3 lg:w-4/5 w-full">
            <div className="bg-secondaryColor p-3 flex flex-0.7 w-full">
                <div
                    {...getRootProps()}
                    className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420 cursor-pointer"
                >
                    <input {...getInputProps()} className="hidden" />

                    {uploadAssets.length ? (
                        uploadAssets.map((asset, index) => (
                            <div key={index} className="relative">
                                {asset.type.startsWith('image/') ? (
                                    <img
                                        src={asset.url}
                                        alt={`uploaded-pic-${index}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={asset.url}
                                        title={`uploaded-video-${index}`}
                                        className="h-full w-full object-cover"
                                        controls
                                    />
                                )}
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 p-1 rounded-full bg-light-1 text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the file input
                                        setuploadAssets(prevAssets => prevAssets.filter((_, i) => i !== index));
                                        URL.revokeObjectURL(asset.url); // Revoke the object URL to free memory
                                    }}
                                >
                                    <img src="/assets/icons/delete.svg" alt="delete" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="file_uploader-box ">
                            <img
                                src="/assets/icons/file-upload.svg"
                                width={96}
                                height={77}
                                alt="file upload"
                            />

                            <h3 className="base-medium text-light-2 mb-2 mt-6">
                                Drag photo or video here
                            </h3>
                            <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG, MP4, MOV, AVI</p>

                            <Button type="button" className="shad-button_dark_4">
                                Select from computer
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
