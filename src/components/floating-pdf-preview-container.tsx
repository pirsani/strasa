"use client";
import useFileStore from "@/hooks/use-file-store";
import FloatingComponent from "./floating-component";
import PdfPreviewContainer from "./pdf-preview-container";

const FloatingPdfPreviewContainer = () => {
  const { fileUrl, isPreviewHidden } = useFileStore();
  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  return (
    <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
      <PdfPreviewContainer className="border-2 h-full border-gray-500" />
    </FloatingComponent>
  );
};

export default FloatingPdfPreviewContainer;
