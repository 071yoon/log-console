'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Sidebar } from '@/components/ui/sidebar';
import { useState, useRef } from 'react';
import LogViewer from './LogViewer';
import type { FileNode } from '@/types';
import type { ImperativePanelHandle } from 'react-resizable-panels';

export default function LogConsole({ fileTree }: { fileTree: FileNode[] }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const panelRef = useRef<ImperativePanelHandle>(null);

  const toggleSidebar = () => {
    if (panelRef.current) {
      if (isSidebarCollapsed) {
        panelRef.current.expand();
      } else {
        panelRef.current.collapse();
      }
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen">
      <ResizablePanel
        ref={panelRef}
        defaultSize={20}
        collapsible={true}
        collapsedSize={4}
        onCollapse={() => setIsSidebarCollapsed(true)}
        onExpand={() => setIsSidebarCollapsed(false)}
        className="min-w-[50px]"
      >
        <Sidebar
          fileTree={fileTree}
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onFileSelect={(path) => {
            setSelectedFile(path);
          }}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <LogViewer selectedFile={selectedFile} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
