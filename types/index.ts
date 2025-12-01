export type FileNode = {
  name: string
  path: string // This will be the absolute path for the server, and public path for client
  type: 'file' | 'folder'
  children?: FileNode[]
}

export interface GroupedLogLine {
  mainLine: string;
  subLines: string[];
  timestamp?: string;
  thread?: string;
  level?: string;
  logger?: string;
  message?: string;
}
