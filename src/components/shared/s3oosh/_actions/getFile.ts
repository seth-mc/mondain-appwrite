"use server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";


export const s3Config = {
  region: import.meta.env.VITE_AWS_REGION,
  bucket: import.meta.env.VITE_S3_BUCKET,
};

export async function getFile(
  fileName: string,
  download?: string | boolean,
  range?: string | null
) {
  const client = new S3Client({ region: s3Config.region });
  const getObjectCommand = new GetObjectCommand({
    Bucket: s3Config.bucket,
    Key: fileName,
  });
  const fileObject = await client.send(getObjectCommand);

  const contentType = fileObject.ContentType || "application/octet-stream";
  const contentLength = fileObject.ContentLength?.toString() || "0";
  const commonHeaders = {
    "Content-Type": contentType,
    "Content-Length": contentLength,
  };

  const createResponse = (
    status: number,
    headers: any,
    stream?: any,
    error?: string
  ) => ({
    status,
    headers,
    stream,
    error,
  });

  const stream = fileObject.Body?.transformToWebStream();
  if (!stream)
    return createResponse(
      500,
      { "Content-Type": "text/plain" },
      undefined,
      "Error retrieving file data"
    );

  if (download === "true") {
    return createResponse(
      200,
      {
        ...commonHeaders,
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
          fileName
        )}`,
      },
      stream
    );
  }

  if (range) {
    const [start, end] = range
      .replace(/bytes=/, "")
      .split("-")
      .map(Number);
    const total = parseInt(contentLength, 10);
    const chunkSize = (end || total - 1) - start + 1;

    return createResponse(
      206,
      {
        ...commonHeaders,
        "Content-Range": `bytes ${start}-${end || total - 1}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
      },
      stream
    );
  }

  return createResponse(200, commonHeaders, stream);
}
