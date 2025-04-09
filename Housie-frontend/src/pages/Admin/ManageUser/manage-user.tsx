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


const users = [
  { id: 1, username: "john_doe" },
  { id: 2, username: "jane_smith" },
  { id: 3, username: "michael_brown" },
  { id: 4, username: "emily_davis" },
  { id: 5, username: "chris_evans" },
  { id: 6, username: "scarlett_johansson" },
  { id: 7, username: "robert_downey" },
  { id: 8, username: "mark_ruffalo" },
  { id: 9, username: "chris_hemsworth" },
  { id: 10, username: "tom_holland" },
  { id: 11, username: "brie_larson" },
  { id: 12, username: "samuel_jackson" },
];

export default function ManageUser() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const usersPerPage = 10;

  const handleGenerateCredentials = () => {
    const password = Math.random().toString(36).slice(-8); // Generate a random 8-character password
    setGeneratedCredentials({ username: newUsername, password });
    setDialogOpen(false); // Close the "Add User" dialog
    setCredentialsDialogOpen(true); // Open the credentials dialog
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <div className="flex items-center gap-4 mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleGenerateCredentials}>Generate Credentials</Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableCaption>A list of all registered users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[200px]">Username</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
              <TableCell className="font-medium">{user.username}</TableCell>
              <TableCell className="text-right">
                <Button className="mr-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Edit
                </Button>
                <Button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
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
      <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generated Credentials</DialogTitle>
          </DialogHeader>
          {generatedCredentials && (
            <div className="grid gap-4 py-4">
              <p>
                <strong>Username:</strong> {generatedCredentials.username}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(generatedCredentials.username)}
                  className="ml-2"
                >
                  Copy
                </Button>
              </p>
              <p>
                <strong>Password:</strong> {generatedCredentials.password}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(generatedCredentials.password)}
                  className="ml-2"
                >
                  Copy
                </Button>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setCredentialsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}