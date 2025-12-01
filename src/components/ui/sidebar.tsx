'use client';

import {
  File,
  Folder,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { FileNode } from '@/types';

import { Button } from './button';

function FileTree({
  node,
  onFileSelect,
  selectedFile,
}: {
  node: FileNode;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (node.type === 'folder') {
    return (
      <Collapsible className="ml-2" open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="m-1 flex w-full items-center gap-2 rounded-md pl-4 p-1.5 text-sm font-medium hover:bg-muted data-[state=open]:bg-muted">
          {isOpen ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          <span>{node.name}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <FileTree
              key={child.path}
              node={child}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="pl-4 flex gap-2 w-full">
      <Button
        variant={selectedFile === node.path ? 'secondary' : 'ghost'}
        className="w-full justify-start"
        onClick={() => onFileSelect(node.path)}
      >
        <File className="h-4 w-4" />
        <span>{node.name}</span>
      </Button>
    </div>
  );
}

export function Sidebar({
  fileTree,
  isSidebarCollapsed,
  toggleSidebar,
  onFileSelect,
  selectedFile,
}: {
  fileTree: FileNode[];
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}) {
  return (
    <div className="p-2">
      <div
        className={`flex items-center ${
          isSidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!isSidebarCollapsed && (
          <h2 className="text-lg font-semibold pl-2">Files</h2>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isSidebarCollapsed && (
        <div className="mt-4">
          {fileTree.map((node) => (
            <FileTree
              key={node.path}
              node={node}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
