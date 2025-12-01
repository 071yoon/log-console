'use client';

import { useState } from 'react';

import { LogConsole } from '../../src';

const logFiles = [
  '/logs/emqx/emqx_1.log',
  '/logs/emqx/log1.log',
  '/logs/java/application.log',
  '/logs/test1/log2.log',
  '/logs/test1/log3.log',
  '/logs/test1/test_log.log',
  '/logs/test2/another_log.log',
  '/logs/test2/log4.log',
  '/logs/test2/log5.log',
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Log Files</h2>
        <ul>
          {logFiles.map((file) => (
            <li key={file}>
              <button
                className={`w-full text-left p-2 rounded ${
                  selectedFile === file ? 'bg-gray-200' : ''
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4">
        <LogConsole logFileUrl={selectedFile} />
      </div>
    </div>
  );
}
