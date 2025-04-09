import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const videos = [
  { id: 1, name: "Video 1", videoLink: "https://example.com/video1.mp4" },
  { id: 2, name: "Video 2", videoLink: "https://example.com/video2.mp4" },
  // Add more videos as needed
];

export default function ManageVideos() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newVideoName, setNewVideoName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<{ id: number; name: string } | null>(null);
  const videosPerPage = 10;
  const [videoList, setVideoList] = useState(videos);

  const handleUploadVideo = () => {
    if (newVideoName.trim() === "") {
      alert("Please provide a name for the video.");
      return;
    }
    const newVideo = {
      id: videoList.length + 1,
      name: newVideoName,
      videoLink: `https://example.com/${newVideoName.toLowerCase().replace(/\s+/g, "-")}.mp4`,
    };
    setVideoList([...videoList, newVideo]);
    setDialogOpen(false); // Close the dialog
    setNewVideoName(""); // Reset the input field
  };

  const handleDeleteVideo = (id: number) => {
    setVideoList(videoList.filter((video) => video.id !== id));
  };

  const handleEditVideo = (id: number, name: string) => {
    setEditingVideo({ id, name });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingVideo && newVideoName.trim() !== "") {
      setVideoList(
        videoList.map((video) =>
          video.id === editingVideo.id ? { ...video, name: newVideoName } : video
        )
      );
      setEditDialogOpen(false);
      setNewVideoName("");
    } else {
      alert("Please provide a valid name.");
    }
  };

  const filteredVideos = videoList.filter((video) =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const currentVideos = filteredVideos.slice(startIndex, startIndex + videosPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Videos</h1>
      <div className="flex items-center gap-4 mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Upload Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Video</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoName" className="text-right">
                  Video Name
                </Label>
                <Input
                  id="videoName"
                  value={newVideoName}
                  onChange={(e) => setNewVideoName(e.target.value)}
                  placeholder="Enter video name"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoFile" className="text-right">
                  Video File
                </Label>
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUploadVideo}>Upload</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableCaption>A list of all uploaded videos.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[200px]">Video Name</TableHead>
            <TableHead className="w-[300px]">Video Link</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentVideos.map((video, index) => (
            <TableRow key={video.id}>
              <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
              <TableCell className="font-medium">{video.name}</TableCell>
              <TableCell className="font-medium">
                <a
                  href={video.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Video
                </a>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => handleEditVideo(video.id, video.name)}
                >
                  Edit
                </Button>
                <Button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteVideo(video.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                isActive={currentPage === i + 1}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editVideoName" className="text-right">
                New Video Name
              </Label>
              <Input
                id="editVideoName"
                value={newVideoName}
                onChange={(e) => setNewVideoName(e.target.value)}
                placeholder="Enter new video name"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save</Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}