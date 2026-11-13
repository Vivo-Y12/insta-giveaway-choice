"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Sparkles, Trash2, ClipboardPaste, Users } from "lucide-react";
import { useGiveawayStore } from "@/lib/giveaway/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function EntriesStep() {
  const rawInput = useGiveawayStore((s) => s.rawInput);
  const entries = useGiveawayStore((s) => s.entries);
  const qualifiedCount = useGiveawayStore((s) => s.qualified.length);
  const setRawInput = useGiveawayStore((s) => s.setRawInput);
  const loadSample = useGiveawayStore((s) => s.loadSample);
  const clearEntries = useGiveawayStore((s) => s.clearEntries);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const readFile = useCallback(
    (file: File) => {
      setFileError(null);
      const allow = [".txt", ".csv", ".tsv", ".log"];
      const ok = allow.some((ext) => file.name.toLowerCase().endsWith(ext)) || file.type.startsWith("text/");
      if (!ok) {
        setFileError(`Unsupported file type. Accepted: ${allow.join(", ")}`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError("File too large (max 5 MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        // Append to existing input rather than overwriting — common workflow
        // is to paste the post caption then upload a comments export.
        setRawInput(rawInput ? `${rawInput.trimEnd()}\n${text}` : text);
      };
      reader.onerror = () => setFileError("Could not read the file.");
      reader.readAsText(file);
    },
    [rawInput, setRawInput],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  };

  const onPasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRawInput(rawInput ? `${rawInput.trimEnd()}\n${text}` : text);
    } catch {
      setFileError("Clipboard access was blocked by the browser.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Paste entries</h2>
            <p className="text-sm text-muted-foreground">
              One per line. Formats:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">username: comment</code>,{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">@user comment</code>, or{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">user, comment</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onPasteFromClipboard}>
              <ClipboardPaste className="mr-1.5 h-4 w-4" /> Paste
            </Button>
            <Button size="sm" variant="outline" onClick={loadSample}>
              <Sparkles className="mr-1.5 h-4 w-4" /> Sample data
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearEntries}
              disabled={!rawInput}
              className="text-muted-foreground"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear
            </Button>
          </div>
        </div>

        <Textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={`@alex_w Love this! @sarah_j #giveaway\nsarah_j: Fingers crossed! #giveaway\nmikey_p, would love to win #win`}
          className="min-h-[260px] resize-y font-mono text-sm leading-relaxed"
          spellCheck={false}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-6 text-center transition-colors",
            dragOver
              ? "border-pink-500 bg-pink-500/5"
              : "border-muted-foreground/20 hover:border-muted-foreground/40",
          )}
        >
          <Upload className="mb-2 h-5 w-5 text-muted-foreground" />
          <p className="text-sm">
            Drag &amp; drop a <span className="font-medium">.txt / .csv</span> file, or{" "}
            <button
              type="button"
              className="font-medium text-pink-600 underline-offset-2 hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Up to 5 MB. Contents are appended to the textarea.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv,.tsv,.log,text/plain,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {fileError && (
          <p className="text-sm text-destructive" role="alert">
            {fileError}
          </p>
        )}
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Parsed entries
            </div>
            <Badge className="bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white">
              {entries.length}
            </Badge>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">After rules</span>
            <span className="font-medium text-foreground">{qualifiedCount}</span>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="flex items-center gap-2 border-b px-4 py-2.5 text-sm font-medium">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Preview
            <span className="ml-auto text-xs text-muted-foreground">{entries.length} rows</span>
          </div>
          <ScrollArea className="h-[360px]">
            <ol className="divide-y">
              {entries.length === 0 && (
                <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No entries yet. Paste some text above or load sample data.
                </li>
              )}
              {entries.map((e, i) => (
                <li key={e.id} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">@{e.username}</div>
                    {e.comment && (
                      <div className="truncate text-xs text-muted-foreground">{e.comment}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
