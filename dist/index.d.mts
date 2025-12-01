import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';

interface LogConsoleProps {
    logFileUrl: string | null;
    initialDisplayLines?: number;
}
declare function LogConsole({ logFileUrl, initialDisplayLines, }: LogConsoleProps): react_jsx_runtime.JSX.Element;

declare function useLogScroll(): {
    scrollViewportRef: react.RefObject<HTMLDivElement | null>;
    handleScroll: () => void;
    scrollToBottom: () => void;
    isAtBottom: boolean;
    isAtTop: boolean;
    getScrollInfo: () => {
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
    };
    setScrollTop: (position: number) => void;
};

type FileNode = {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: FileNode[];
};
interface GroupedLogLine {
    id: string;
    mainLine: string;
    subLines: string[];
    timestamp?: string;
    thread?: string;
    level?: string;
    logger?: string;
    message?: string;
}

declare function useLogStats(logs: GroupedLogLine[]): {
    total: number;
    errors: number;
    warnings: number;
};

export { type FileNode, type GroupedLogLine, LogConsole, useLogScroll, useLogStats };
