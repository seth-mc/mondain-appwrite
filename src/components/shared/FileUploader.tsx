import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";
import smartcrop from "smartcrop";
import Upscaler from "upscaler";


type FileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrls: string[];
};

type ImageAsset = {
    url: string;
    file: File;
}

const FileUploader = ({ fieldChange, mediaUrls }: FileUploaderProps) => {
    const [file, setFile] = useState<File[]>([]);
    const [fileUrls, setFileUrls] = useState<string[]>(mediaUrls);
    const [imageAssets, setImageAssets] = useState<ImageAsset[]>([]);


    const cropImage = async (file: File, targetWidth: number, targetHeight: number): Promise<File> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = URL.createObjectURL(file);
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(image, 0, 0);

                smartcrop.crop(image, { width: targetWidth, height: targetHeight }).then(result => {
                    const crop = result.topCrop;
                    canvas.width = crop.width;
                    canvas.height = crop.height;
                    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
                    canvas.toBlob(blob => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: file.type }));
                        } else {
                            reject(new Error('Failed to create Blob from canvas'));
                        }
                    }, file.type);
                });
            };
            image.onerror = reject;
        });
    };

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

        return await cropImage(processedFile, targetWidth, targetHeight);
    }, []);



    const processVideo = async (file: File) => {
        // Implement video processing logic here
        // Extract thumbnail, etc.
    };

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
          acceptedFiles.forEach(async (file) => {
            if (file.type.startsWith('image/')) {
              try {
                const processedFile = await processImage(file);
                const url = URL.createObjectURL(processedFile);
                setImageAssets(prev => [...prev, { url, file: processedFile }]);
              } catch (error) {
                console.error("Error processing file:", error);
              }
            }
          });
        },
        [processImage]
      );
      
      // Use useEffect to update the parent state when imageAssets changes
      useEffect(() => {
        const files = imageAssets.map(asset => asset.file);
        fieldChange(files);
      }, [imageAssets, fieldChange]);
      

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpeg", ".jpg", ".svg", ".gif", ".tiff"],
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

                    {imageAssets.length ? (
                        imageAssets.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={`uploaded-pic-${index}`}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 p-1 rounded-full bg-light-1 text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the file input
                                        setImageAssets(prevImages => prevImages.filter((_, i) => i !== index));
                                        URL.revokeObjectURL(image.url); // Revoke the object URL to free memory
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
                                Drag photo here
                            </h3>
                            <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

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
