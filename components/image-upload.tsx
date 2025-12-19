'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import Image from 'next/image';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { processImage } from '@/lib/image-utils';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  showDropzone?: boolean;
  className?: string;
}

type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function ImageUpload({ onUploadComplete, showDropzone = true, className }: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [processedImage, setProcessedImage] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        setUploadedUrl(res[0].url);
        setIsUploading(false);
        onUploadComplete?.(res[0].url);
      }
    },
    onUploadError: (error: Error) => {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setUploadedUrl(null);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const onCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleProcessImage = async () => {
    if (!imageSrc) return;

    try {
      // Use croppedAreaPixels if available, otherwise process the full image
      const blob = await processImage(imageSrc, croppedAreaPixels || undefined);
      setProcessedImage(blob);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setProcessedImage(null);
    setUploadedUrl(null);
  };

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-4 ${className || ''}`}>
      {!imageSrc && !uploadedUrl && showDropzone && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
          </p>
          <p className="text-sm text-muted-foreground">or click to select</p>
          <p className="text-xs text-muted-foreground mt-2">Supports: PNG, JPG, JPEG, GIF, WebP</p>
        </div>
      )}

      {imageSrc && !processedImage && (
        <Dialog open={true} onOpenChange={(open) => !open && handleReset()}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Crop Your Image</DialogTitle>
              <DialogDescription>
                Adjust the crop area and zoom. The image will be resized to 500x500 and converted to WebP format.
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full h-[500px] bg-black rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                objectFit="contain"
                restrictPosition={true}
                minZoom={1}
                maxZoom={5}
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                  },
                }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Zoom: {zoom.toFixed(1)}x</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleProcessImage}>
                  <Check className="w-4 h-4 mr-2" />
                  Process Image
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {processedImage && !uploadedUrl && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Processed Image Preview</h3>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- Blob URLs are not supported by Next.js Image */}
              <img
                src={URL.createObjectURL(processedImage)}
                alt="Processed"
                className="w-32 h-32 object-cover rounded border"
              />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Size: {(processedImage.size / 1024).toFixed(2)} KB</p>
                <p className="text-sm text-muted-foreground">Format: WebP</p>
                <p className="text-sm text-muted-foreground">Dimensions: 500x500</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Start Over
            </Button>
            <Button
              onClick={async () => {
                if (!processedImage) return;
                setIsUploading(true);
                const file = new File([processedImage], 'image.webp', { type: 'image/webp' });
                await startUpload([file]);
              }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload to UploadThing'}
            </Button>
          </div>
        </div>
      )}

      {uploadedUrl && (
        <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">Upload Successful!</h3>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">Your image has been uploaded successfully.</p>
          <div className="flex items-center gap-4">
            <Image
              src={uploadedUrl}
              alt="Uploaded"
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded border"
              unoptimized
            />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Image URL:</p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          </div>
          <Button variant="outline" onClick={handleReset} className="mt-4">
            Upload Another Image
          </Button>
        </div>
      )}
    </div>
  );
}
