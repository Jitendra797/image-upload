'use client';

import { useState } from 'react';
import { User, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ImageUpload } from '@/components/image-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ProfileAvatarUploadProps {
  currentImageUrl?: string;
  onUploadComplete?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40',
};

export function ProfileAvatarUpload({ currentImageUrl, onUploadComplete, size = 'lg' }: ProfileAvatarUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(currentImageUrl);

  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url);
    setIsDialogOpen(false);
    onUploadComplete?.(url);
  };

  return (
    <>
      <div className="relative inline-block group cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <Avatar className={`${sizeClasses[size]} border-2 border-border transition-all group-hover:border-primary`}>
          <AvatarImage src={uploadedUrl} alt="Profile" />
          <AvatarFallback className="bg-muted">
            <User className="w-1/2 h-1/2 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
          <Camera className="w-4 h-4" />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Profile Picture</DialogTitle>
            <DialogDescription>
              Upload and crop your profile picture. It will be resized to 500x500 and converted to WebP format.
            </DialogDescription>
          </DialogHeader>
          <ImageUpload onUploadComplete={handleUploadComplete} showDropzone={true} />
        </DialogContent>
      </Dialog>
    </>
  );
}
