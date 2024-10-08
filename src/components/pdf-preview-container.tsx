"use client";

import PdfPreview from "@/components/pdf-preview";
import useFileStore from "@/hooks/use-file-store";
import { useEffect } from "react";

interface PdfPreviewContainerProps {
  className?: string;
}

const PdfPreviewContainer = ({ className }: PdfPreviewContainerProps) => {
  const fileUrl = useFileStore((state) => state.fileUrl);
  const { setFileUrl } = useFileStore();

  useEffect(() => {
    // setFileUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <PdfPreview fileUrl={fileUrl} className={className} />;
};

export default PdfPreviewContainer;
