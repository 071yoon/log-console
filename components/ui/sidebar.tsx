"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Button } from "./button";
import { Folder, File, FolderOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { FileNode } from "@/types";

function FileTree({
  node,
  onFileSelect,
}: {
  node: FileNode;
  onFileSelect: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (node.type === "folder") {
    return (
      <Collapsible className="ml-4" open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md p-1.5 text-sm font-medium hover:bg-muted data-[state=open]:bg-muted">
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
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      className="ml-4 flex w-full justify-start gap-2"
      onClick={() => onFileSelect(node.path)}
    >
      <File className="h-4 w-4" />
      <span>{node.name}</span>
    </Button>
  );
}

export function Sidebar({
  fileTree,
  isSidebarCollapsed,
  toggleSidebar,
  onFileSelect,
}: {
  fileTree: FileNode[];
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  onFileSelect: (path: string) => void;
}) {
  return (
    <div className="p-2">
      <div
        className={`flex items-center ${
          isSidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!isSidebarCollapsed && (
          <h2 className="text-lg font-semibold">Files</h2>
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
            <FileTree key={node.path} node={node} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
