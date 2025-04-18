import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useRef, useState } from 'react';

interface VideoEntry {
  file: File;
  url: string;
  name: string;
}

interface UserHeaderProps {
  onDirectoryVideosChange?: (videos: VideoEntry[]) => void;
  onVideoStatusChange?: (status: string) => void;
}

export default function UserHeader({ onDirectoryVideosChange, onVideoStatusChange }: UserHeaderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const handleDirectorySelect = async () => {
    try {
      // @ts-ignore - TypeScript doesn't know about showDirectoryPicker yet
      const directoryHandle = await window.showDirectoryPicker();
      const videos: VideoEntry[] = [];
      
      for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && 
            entry.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          videos.push({
            file,
            url,
            name: file.name
          });
        }
      }
      
      onDirectoryVideosChange?.(videos);
      onVideoStatusChange?.(`Loaded ${videos.length} videos from directory`);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error accessing directory:', error);
      onVideoStatusChange?.('Error accessing directory');
    }
  };

  const handleDirectoryInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
      .filter(file => file.type.startsWith('video/') || 
              file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i));
    
    const videos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    onDirectoryVideosChange?.(videos);
    onVideoStatusChange?.(`Loaded ${videos.length} videos from directory`);
    setIsDialogOpen(false);
  };

  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <h1 className="text-xl font-bold">User Dashboard</h1>
      <div className="flex items-center space-x-4">
        <a href="/about-us" className="text-white hover:underline">
          About Us
        </a>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Choose Directory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Select Directory</DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-4">
              
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  onClick={() => directoryInputRef.current?.click()}
                  className="w-full"
                >
                  Select Directory (Fallback)
                </Button>
                <input
                  type="file"
                  ref={directoryInputRef}
                  onChange={handleDirectoryInputChange}
                  style={{ display: 'none' }}
                  // @ts-ignore - webkitdirectory is not in the type definitions
                  webkitdirectory=""
                  directory=""
                  multiple
                  accept="video/*"
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}