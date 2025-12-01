'use client';

import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

function LogStats({
  stats,
}: {
  stats: { total: number; errors: number; warnings: number };
}) {
  return (
    <div className="flex items-center gap-4">
      <Badge variant="outline">Total: {stats.total}</Badge>
      <Badge variant="destructive">Errors: {stats.errors}</Badge>
      <Badge variant="secondary">Warnings: {stats.warnings}</Badge>
    </div>
  );
}

interface LogHeaderProps {
  onSearchChange: (term: string) => void;
  isTailingEnabled: boolean;
  onTailingChange: (enabled: boolean) => void;
  stats: { total: number; errors: number; warnings: number };
}

export function LogHeader({
  onSearchChange,
  isTailingEnabled,
  onTailingChange,
  stats,
}: LogHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <div className="w-full flex-1">
        <Input
          placeholder="Search logs..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-end gap-1">
        <div className="flex items-center gap-2 mr-4">
          <Label htmlFor="tail-switch" className="text-xs">
            Live Tailing
          </Label>
          <Switch
            id="tail-switch"
            checked={isTailingEnabled}
            onCheckedChange={onTailingChange}
          />
        </div>
        <LogStats stats={stats} />
      </div>
    </header>
  );
}
