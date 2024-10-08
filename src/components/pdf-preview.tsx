"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const isObjectUrl = (url: string): boolean => {
  const objectUrlPattern = /^blob:.+/;
  return objectUrlPattern.test(url);
};

interface PdfViewerSkeletonProps {
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const PdfViewerSkeleton = ({
  placeholder,
  className,
  isLoading = true,
}: PdfViewerSkeletonProps) => (
  <div
    className={cn(
      "pdf-viewer-skeleton w-full bg-gray-200 ",
      isLoading && "min-h-24 max-h-96 animate-pulse",
      className && className
    )}
  >
    <div className="flex flex-col h-full items-center justify-center text-gray-500">
      {placeholder || "Loading ..."}
    </div>
  </div>
);

interface PdfPreviewProps {
  fileUrl?: string | null;
  className?: string;
}

export const PdfPreview = ({ fileUrl, className }: PdfPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const handleError = () => {
    setIsLoading(false);
    // Optionally, add error handling logic here
    console.error("Failed to load PDF file");
  };
  // Reset isLoading state when fileUrl changes
  useEffect(() => {
    if (!fileUrl) {
      handleError();
      return;
    }
    if (isObjectUrl(fileUrl)) {
      setIframeSrc(fileUrl);
      console.log("object url", fileUrl);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true); // Set loading state to true when a new fileUrl is set
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setIframeSrc(blobUrl);
      } catch (error) {
        handleError();
      } finally {
        setIsLoading(false);
      }
    };
    setIframeSrc(null);
    loadPdf();
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <div className="w-full h-full  border-t-0">
        <PdfViewerSkeleton
          className={className + " animate-none "}
          placeholder="pdf preview"
        />
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div className="w-full  border-t-0">
        <PdfViewerSkeleton
          className={className + " animate-none "}
          placeholder="pdf preview"
        />
      </div>
    );
  }

  return (
    <div className="w-full  border-t-0 h-full">
      {isLoading && <PdfViewerSkeleton className={className} />}
      {!iframeSrc && !isLoading && (
        <PdfViewerSkeleton
          className={className}
          placeholder="file not found"
          isLoading={isLoading}
        />
      )}
      {iframeSrc && !isLoading && (
        <iframe
          src={iframeSrc}
          className={cn(`w-full`, className && className)}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};

export default PdfPreview;
