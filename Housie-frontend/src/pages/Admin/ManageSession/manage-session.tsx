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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

const sessions = [
  { id: 1, sessionId: "S001", username: "john_doe" },
  { id: 2, sessionId: "S002", username: "jane_smith" },
];

const users = [
  { id: 1, username: "john_doe" },
  { id: 2, username: "jane_smith" },
  { id: 3, username: "michael_brown" },
];

const videos = [
  { id: 1, name: "Video 1" },
  { id: 2, name: "Video 2" },
  { id: 3, name: "Video 3" },
];

export default function ManageSession() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedDialogOpen, setGeneratedDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [tickets, setTickets] = useState(0);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");

  const sessionsPerPage = 10;
  const [sessionList, setSessionList] = useState(sessions);

  const handleAddSession = () => {
    const newSession = {
      id: sessionList.length + 1,
      sessionId: `S00${sessionList.length + 1}`,
      username: selectedUser,
    };
    setSessionList([...sessionList, newSession]);
    setDialogOpen(false); // Close the dialog
    setGeneratedDialogOpen(true); // Open the generated file dialog
  };

  const handleDeleteSession = (id: number) => {
    setSessionList(sessionList.filter((session) => session.id !== id));
  };

  const handleVideoSelection = (id: number) => {
    setSelectedVideos((prev) =>
      prev.includes(id) ? prev.filter((videoId) => videoId !== id) : [...prev, id]
    );
  };

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(videoSearchQuery.toLowerCase())
  );

  const filteredSessions = sessionList.filter((session) =>
    session.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const currentSessions = filteredSessions.slice(startIndex, startIndex + sessionsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Sessions</h1>
      <div className="flex items-center gap-4 mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Session</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Session Details</TabsTrigger>
                <TabsTrigger value="videos">Videos</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                    <CardDescription>
                      Provide session information below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="username">Username</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {selectedUser || "Select a user"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search user..." />
                            <CommandList>
                              <CommandEmpty>No user found.</CommandEmpty>
                              <CommandGroup>
                                {users.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => setSelectedUser(user.username)}
                                  >
                                    {user.username}
                                    <Check
                                      className={`ml-auto ${
                                        selectedUser === user.username
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="tickets">Number of Tickets</Label>
                      <Input
                        id="tickets"
                        type="number"
                        value={tickets}
                        onChange={(e) => setTickets(Number(e.target.value))}
                        placeholder="Enter number of tickets"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="videos">
  <Card>
    <CardHeader>
      <CardTitle>Videos</CardTitle>
      <CardDescription>
        Select videos to associate with this session.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Input
        type="text"
        placeholder="Search videos..."
        value={videoSearchQuery}
        onChange={(e) => setVideoSearchQuery(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Video Name</TableHead>
            <TableHead>Select</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVideos.map((video) => (
            <TableRow
              key={video.id}
              className="cursor-pointer"
              onClick={() => handleVideoSelection(video.id)}
            >
              <TableCell>{video.name}</TableCell>
              <TableCell>
                <Checkbox
                  checked={selectedVideos.includes(video.id)}
                  onChange={() => handleVideoSelection(video.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>
            </Tabs>
            <DialogFooter>
              <Button onClick={handleAddSession}>Generate tickets</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Input
          type="text"
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableCaption>A list of all sessions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[200px]">Session ID</TableHead>
            <TableHead className="w-[200px]">Username</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentSessions.map((session, index) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
              <TableCell className="font-medium">{session.sessionId}</TableCell>
              <TableCell className="font-medium">{session.username}</TableCell>
              <TableCell className="text-right">
                <Button className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Edit
                </Button>
                <Button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteSession(session.id)}
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
      <Dialog open={generatedDialogOpen} onOpenChange={setGeneratedDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generated Tickets</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Your tickets have been generated successfully.</p>
            <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Download Tickets
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setGeneratedDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}