"use client";
import useFileStore from "@/hooks/use-file-store";
import { useEffect } from "react";
import FloatingComponent from "./floating-component";
import PdfPreviewContainer from "./pdf-preview-container";

interface FloatingPdfPreviewContainerProps {
  hide?: boolean;
}
const FloatingPdfPreviewContainer = ({
  hide = true,
}: FloatingPdfPreviewContainerProps) => {
  const { fileUrl, isPreviewHidden } = useFileStore();
  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  useEffect(() => {
    useFileStore.setState({ isPreviewHidden: hide });
  }, [hide]);

  return (
    <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
      <PdfPreviewContainer className="border-2 h-full border-gray-500" />
    </FloatingComponent>
  );
};

export default FloatingPdfPreviewContainer;
