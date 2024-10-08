"use client";
import React from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { Button } from "./ui/button";

//https://mortenbarklund.com/blog/react-typescript-props-spread/
interface DropzoneProps {
  options: DropzoneOptions;
  className?: string;
  children?: React.ReactNode;
}

const defaultChildren = (): React.ReactNode => {
  return (
    <p className="text-muted-foreground">
      Drag and drop some files here, or click to select files
    </p>
  );
};

const Dropzone = ({ options, children, ...props }: DropzoneProps) => {
  const { acceptedFiles, fileRejections, getRootProps, getInputProps, open } =
    useDropzone({
      onDrop: options.onDrop,
      accept: options.accept,
      noClick: options.noClick,
      noKeyboard: options.noKeyboard,
    });

  return (
    <>
      <Button variant={"default"} onClick={open} className="m-2">
        Select files to upload
      </Button>
      <div {...getRootProps({ ...props })}>
        <input {...getInputProps()} />
        {children ? children : defaultChildren()}
      </div>
    </>
  );
};

export default Dropzone;
