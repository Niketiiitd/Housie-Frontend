import UserHeader from "@/components/User/user-header";
import { useState } from "react";
import { Outlet } from "react-router-dom";

interface VideoEntry {
  file: File;
  url: string;
  name: string;
}

interface QuizEntry {  // Added quiz interface
  file: File;
  url: string;
  name: string;
}

interface Session {
  id: number;
  name: string;
}

export default function UserLayout() {
  // Hardcoded session data for testing
  const hardcodedSessions: Session[] = [
    { id: 1, name: "Session 1" },
    { id: 2, name: "Session 2" },
    { id: 3, name: "Session 3" },
  ];

  const [sessions] = useState<Session[]>(hardcodedSessions);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [directoryVideos, setDirectoryVideos] = useState<VideoEntry[]>([]);
  const [videoStatus, setVideoStatus] = useState<string>("");
  const [quizDirectory, setQuizDirectory] = useState<QuizEntry[]>([]); // Use QuizEntry type for quiz directory
  const [isSequentialMode, setIsSequentialMode] = useState(false); // Add state for sequential mode

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const handleDirectoryVideosChange = (videos: VideoEntry[]) => {
    setDirectoryVideos(videos);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* <ColoredPointer /> Add the ColoredPointer */}
      <UserHeader
        onDirectoryVideosChange={handleDirectoryVideosChange}
        onVideoStatusChange={setVideoStatus}
        onQuizDirectoryChange={setQuizDirectory}  // Pass setter for quiz directory
        onModeChange={setIsSequentialMode} // Pass the setter for sequential mode
      />
      <Outlet
        context={{
          selectedSession,
          directoryVideos,
          setDirectoryVideos,
          videoStatus,
          setVideoStatus,
          quizDirectory,      // Pass quiz directory
          setQuizDirectory,   // Pass setter for quiz directory
          isSequentialMode,   // Pass sequential mode state
          setSequentialMode: setIsSequentialMode // Pass setter for sequential mode
        }}
      />
    </div>
  );
}