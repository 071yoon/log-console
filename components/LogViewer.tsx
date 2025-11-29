"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import { throttle } from "es-toolkit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function LogStats({
  logCount,
  errorCount,
  warningCount,
}: {
  logCount: number;
  errorCount: number;
  warningCount: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <Badge variant="outline">Total: {logCount}</Badge>
      <Badge variant="destructive">Errors: {errorCount}</Badge>
      <Badge variant="secondary">Warnings: {warningCount}</Badge>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

function LogViewer({ selectedFile }: { selectedFile: string | null }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logCount, setLogCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isTailingEnabled, setIsTailingEnabled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const loadFile = async () => {
    if (!selectedFile) return;
    // Don't show loading spinner for tailing refreshes
    if (logs.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const publicPath = selectedFile.startsWith("/")
        ? selectedFile
        : selectedFile.split("/public")[1];
      const response = await fetch(publicPath);

      if (!response.ok) {
        throw new Error(`Failed to fetch log file: ${response.statusText}`);
      }

      const text = await response.text();
      setLogs(text.split("\n"));
    } catch (e: any) {
      setError(e.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect for auto-scrolling
  useEffect(() => {
    if (isAtBottom && scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop =
        scrollViewportRef.current.scrollHeight;
    }
  }, [logs, isAtBottom]);

  // Effect for stats calculation
  useEffect(() => {
    setLogCount(logs.length);
    setErrorCount(
      logs.filter((log) => log.toLowerCase().includes("error")).length
    );
    setWarningCount(
      logs.filter((log) => log.toLowerCase().includes("warn")).length
    );
  }, [logs]);

  // Effect for initial file load
  useEffect(() => {
    setLogs([]);
    loadFile();
  }, [selectedFile]);

  // Effect for tailing
  useEffect(() => {
    if (isTailingEnabled && selectedFile) {
      const interval = setInterval(loadFile, 1000);
      return () => clearInterval(interval);
    }
  }, [isTailingEnabled, selectedFile]);

  const handleSearch = throttle((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleScroll = () => {
    const viewport = scrollViewportRef.current;
    if (viewport) {
      const isScrolledToBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 1;
      setIsAtBottom(isScrolledToBottom);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) =>
      log.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Loading File</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!selectedFile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Please select a file to view logs.</p>
      </div>
    );
  }

  // Reverse logs for display
  const reversedLogs = [...filteredLogs].reverse();

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1">
          <Input
            placeholder="Search logs..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <LogStats
            logCount={logCount}
            errorCount={errorCount}
            warningCount={warningCount}
          />
          <div className="flex items-center gap-2">
            <Label htmlFor="tail-switch" className="text-xs">
              Live Tailing
            </Label>
            <Switch
              id="tail-switch"
              checked={isTailingEnabled}
              onCheckedChange={setIsTailingEnabled}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <ScrollArea
          className="h-[calc(100vh-120px)]"
          ref={scrollViewportRef}
          onScroll={handleScroll}
        >
          <pre className="text-xs p-1">
            {filteredLogs.map((line, i) => (
              <div key={i} className="flex">
                <div className="w-12 select-none text-right opacity-50">
                  {i + 1}
                </div>
                <div className="flex-1 pl-4">{line}</div>
              </div>
            ))}
          </pre>
        </ScrollArea>
      </main>
    </div>
  );
}

export default LogViewer;
