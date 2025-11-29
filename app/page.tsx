import LogConsole from '@/components/LogConsole'
import type { FileNode } from '@/types'
import fs from 'fs/promises'
import path from 'path'

async function getFileTree(dir: string): Promise<FileNode[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const serverPath = path.resolve(dir, dirent.name)
      const publicPath = serverPath.split('/public')[1]

      if (dirent.isDirectory()) {
        return {
          name: dirent.name,
          type: 'folder',
          path: publicPath,
          children: await getFileTree(serverPath),
        } as FileNode
      } else {
        return {
          name: dirent.name,
          type: 'file',
          path: publicPath,
        } as FileNode
      }
    })
  )
  // Sort to show folders first
  return files.sort((a, b) => {
    if (a.type === 'folder' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  })
}

export default async function Home() {
  const logsDir = path.join(process.cwd(), 'public/logs')
  const fileTree = await getFileTree(logsDir)
  return <LogConsole fileTree={fileTree} />
}
