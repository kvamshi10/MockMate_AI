"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, File } from "lucide-react";

interface FileUploadZoneProps {
  label: string;
  description: string;
  accept?: string;
  onFile: (file: File | null) => void;
  file: File | null;
  icon?: React.ReactNode;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-cyan-400" />;
  if (file.type === "application/pdf") return <FileText className="h-5 w-5 text-red-400" />;
  return <File className="h-5 w-5 text-violet-400" />;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUploadZone = ({
  label,
  description,
  accept = ".pdf,.txt,.png,.jpg,.jpeg,.webp,.doc,.docx",
  onFile,
  file,
  icon,
}: FileUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    onFile(selected);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-white/80">
        {label}
        <span className="ml-1.5 text-[11px] text-muted-foreground font-normal">(optional)</span>
      </label>
      <p className="text-xs text-muted-foreground -mt-1 mb-1">{description}</p>

      {file ? (
        /* File chosen — preview row */
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl glass border border-white/10 animate-fadeIn">
          <div className="flex-shrink-0">{getFileIcon(file)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { onFile(null); if (inputRef.current) inputRef.current.value = ""; }}
            className="h-7 w-7 rounded-full flex items-center justify-center bg-secondary/60 hover:bg-destructive-100/20 hover:text-destructive-100 text-muted-foreground transition-all"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <button
          type="button"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group w-full ${
            dragging
              ? "border-aurora/60 bg-aurora/5 ring-glow"
              : "border-white/10 hover:border-white/25 hover:bg-white/2"
          }`}
        >
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${dragging ? "bg-aurora/20" : "bg-secondary/60 group-hover:bg-secondary"}`}>
            {icon ?? <Upload className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors" />}
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-white transition-colors text-center">
            {dragging ? "Drop it here!" : "Drag & drop or click to upload"}
          </p>
          <p className="text-[11px] text-muted-foreground/60">PDF, Image, or Text — any format</p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadZone;
