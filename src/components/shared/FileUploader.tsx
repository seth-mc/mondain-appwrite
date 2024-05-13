import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui";
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import Upscaler from "upscaler";
import { CloudUpload, Trash2 } from "lucide-react";

const ffmpeg = new FFmpeg();



type FileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrls: string[];
};

type uploadAsset = {
    url: string;
    file: File;
    type: string;
    thumbnail?: string;
}

const FileUploader = ({ fieldChange }: FileUploaderProps) => {
    const [uploadAssets, setuploadAssets] = useState<uploadAsset[]>([]);

    useEffect(() => {
        const loadFFmpeg = async () => {
            await ffmpeg.load();
        };
        loadFFmpeg();
    }, []);

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
        return new Promise<File>((resolve, reject) => {
            const reader = new FileReader();
            reader.onabort = () => reject(new Error('file reading was aborted'));
            reader.onerror = () => reject(new Error('file reading has failed'));
            reader.onload = async () => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result;
                const blob = new Blob([new Uint8Array(binaryStr as ArrayBuffer)], { type: file.type });
                const processedFile = new File([blob], file.name, { type: file.type });

                // Convert video to GIF
                const convertToGif = async () => {
                    console.log("Starting to convert video to GIF");
                
                    console.log("Writing file to FFmpeg");
                    await ffmpeg.writeFile("input.mov", await fetchFile(processedFile));
                    console.log("Finished writing file to FFmpeg");
                
                    console.log("Executing FFmpeg command");
                    await ffmpeg.exec([
                        "-ss", "00:00:00.000", 
                        "-i", "input.mov", 
                        "-pix_fmt", "rgb24", 
                        "-r", "10", 
                        "-s", "320x240", 
                        "-t", "00:00:10.000", 
                        "output.gif"
                    ]);
                    console.log("Finished executing FFmpeg command");
                
                    console.log("Reading file from FFmpeg");
                    const data = await ffmpeg.readFile("output.gif");
                    console.log("Finished reading file from FFmpeg");
                
                    console.log("Optimizing GIF with ImageMagick");
                    const stdout = await ffmpeg.exec(["convert", "-layers", "Optimize", "output.gif", "output_optimized.gif"]);
                    console.log(stdout);
                    console.log("Finished optimizing GIF");
                
                    console.log("Creating object URL");
                    const url = URL.createObjectURL(new Blob([data], { type: "image/gif" }));
                    console.log("Finished creating object URL");
                
                    console.log("Finished converting video to GIF");
                    return url;
                };

                const thumbnail = await convertToGif();

                setuploadAssets(prev => [...prev, { url: URL.createObjectURL(processedFile), file: processedFile, type: file.type, thumbnail }]);
                resolve(processedFile);
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
                        const processedFile = await processVideo(file);
                        const url = URL.createObjectURL(processedFile);
                        setuploadAssets(prev => [...prev, { url, file, type: file.type }]);
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
        fieldChange(files);
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
                                    <Trash2 />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="file_uploader-box ">
                            <CloudUpload size={77}/>

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
