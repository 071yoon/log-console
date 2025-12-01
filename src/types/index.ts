export type FileNode = {
  name: string;
  path: string; // This will be the absolute path for the server, and public path for client
  type: 'file' | 'folder';
  children?: FileNode[];
};

export interface GroupedLogLine {
  id: string; // Unique identifier for the log group
  mainLine: string;
  subLines: string[];
  timestamp?: string;
  thread?: string;
  level?: string;
  logger?: string;
  message?: string;
}
