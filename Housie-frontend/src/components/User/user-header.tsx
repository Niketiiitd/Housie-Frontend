import React, { useState } from 'react';
import { useVideoContext } from '../../VideoContext'; 
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function UserHeader() {
  const { videoPaths } = useVideoContext(); 
  const [isDialogOpen, setIsDialogOpen] = useState(false); 
  const [directoryFiles, setDirectoryFiles] = useState<File[]>([]); // State to store files in the selected directory

  const handleDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files); // Convert FileList to an array
      setDirectoryFiles(files);
      console.log('Selected Directory Files:', files.map((file) => file.name)); // Log file names
    }
  };

  const handleSaveDirectory = () => {
    if (directoryFiles.length > 0) {
      console.log('Saving Directory Files:', directoryFiles.map((file) => file.name));
      setIsDialogOpen(false);
      // Save the directory files in the context or perform any other action
    } else {
      console.log('No files selected in the directory');
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
      <h1 className="text-xl font-bold">User Dashboard</h1>
      <div className="flex items-center space-x-4">
        <a
          href="/about-us"
          className="text-white hover:underline"
        >
          About Us
        </a>

        {/* Button to open dialog */}
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
            <div className="grid gap-4 py-4">
              <input
                type="file"
                ref={(input) => input && input.setAttribute('webkitdirectory', 'true')} // Allows directory selection
                onChange={handleDirectoryChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button
                onClick={handleSaveDirectory}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </Button>
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