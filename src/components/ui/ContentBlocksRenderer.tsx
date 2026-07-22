import React from "react";
import { FileText, ExternalLink } from "lucide-react";
import { getDisplayMediaUrl, openPdf } from "@/lib/utils";

const isEmbedUrl = (url: string) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const getFileName = (url: string) => {
  if (!url) return "PDF Document";
  if (url.startsWith("data:")) return "Attached PDF Document.pdf";
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1];
  return decodeURIComponent(lastPart) || "PDF Document";
};

interface ContentBlock {
  id?: string | number;
  type: 'text' | 'image' | 'video' | 'pdf' | 'url';
  value: string;
  order_num: number;
}

interface ContentBlocksRendererProps {
  blocks?: ContentBlock[] | string;
  images?: string[];
  videos?: string[];
  pdfs?: string[];
  urls?: string[];
}

export function ContentBlocksRenderer({ blocks, images = [], videos = [], pdfs = [], urls = [] }: ContentBlocksRendererProps) {
  let parsedBlocks: unknown[] = [];
  if (Array.isArray(blocks)) {
    parsedBlocks = blocks;
  } else if (typeof blocks === "string" && blocks.trim()) {
    try {
      const parsed = JSON.parse(blocks);
      parsedBlocks = Array.isArray(parsed) ? parsed : [];
    } catch {
      parsedBlocks = [];
    }
  }

  const normalizedBlocks: ContentBlock[] = parsedBlocks.flatMap((block, index) => {
    if (!block || typeof block !== "object") return [];
    const item = block as Record<string, unknown>;
    const type = String(item.type || item.content_type || "").toLowerCase();
    const value = item.value ?? item.content ?? item.content_text ?? item.url;
    if (!['text', 'image', 'video', 'pdf', 'url'].includes(type) || value === undefined || value === null) return [];
    return [{
      id: item.id as string | number | undefined,
      type: type as ContentBlock['type'],
      value: String(value),
      order_num: Number(item.order_num ?? item.order ?? index),
    }];
  });

  // Older responses can include resource arrays as well as content blocks.  The
  // arrays are a legacy fallback, not extra content, so never render both.
  const resourceBlocks: ContentBlock[] = normalizedBlocks.length === 0 ? [
    ...images.map((value, index) => ({ id: `image-${index}`, type: 'image' as const, value, order_num: normalizedBlocks.length + index })),
    ...videos.map((value, index) => ({ id: `video-${index}`, type: 'video' as const, value, order_num: normalizedBlocks.length + images.length + index })),
    ...pdfs.map((value, index) => ({ id: `pdf-${index}`, type: 'pdf' as const, value, order_num: normalizedBlocks.length + images.length + videos.length + index })),
    ...urls.map((value, index) => ({ id: `url-${index}`, type: 'url' as const, value, order_num: normalizedBlocks.length + images.length + videos.length + pdfs.length + index })),
  ] : [];

  if (normalizedBlocks.length === 0 && resourceBlocks.length === 0) return null;

  const sortedBlocks = [...normalizedBlocks, ...resourceBlocks]
    .sort((a, b) => (Number(a.order_num) || 0) - (Number(b.order_num) || 0));

  return (
    <div className="space-y-6 mt-6">
      {sortedBlocks.map((block) => {
        const { id, type, value } = block;
        if (value === undefined || value === null) return null;
        const strValue = String(value);
        const blockKey = id !== undefined && id !== null ? String(id) : `block-${block.order_num}`;

        switch (type) {
          case "text":
            return (
              <div 
                key={blockKey}
                className="text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: strValue }}
              />
            );
          case "image":
            return (
              <div key={blockKey} className="flex justify-center my-6">
                <div className="w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={getDisplayMediaUrl(strValue)} 
                    alt="Image Resource" 
                    className="w-full h-auto object-cover max-h-[500px]"
                  />
                </div>
              </div>
            );
          case "video":
            return (
              <div key={blockKey} className="flex justify-center my-6">
                <div className="w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-black relative">
                  {isEmbedUrl(strValue) ? (
                    <iframe
                      src={getEmbedUrl(strValue)}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={getDisplayMediaUrl(strValue)}
                      controls
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            );
          case "pdf":
            return (
              <div key={blockKey} className="flex justify-center my-4 w-full">
                <div className="w-full max-w-3xl border border-red-100 rounded-2xl p-4 sm:p-5 bg-red-50/20 hover:bg-red-50/45 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-200/50 shrink-0">
                      <FileText size={22} />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-wider">PDF Resource</p>
                      <h4 className="text-sm font-bold text-slate-800 truncate block mt-0.5" title={getFileName(strValue)}>
                        {getFileName(strValue)}
                      </h4>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => openPdf(strValue)}
                    className="px-4 sm:px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 uppercase tracking-wider w-full sm:w-auto text-center"
                  >
                    Open PDF
                  </button>
                </div>
              </div>
            );
          case "url":
            return (
              <div key={blockKey} className="flex justify-center my-4 w-full">
                <div className="w-full max-w-3xl border border-blue-100 rounded-2xl p-4 sm:p-5 bg-blue-50/15 hover:bg-blue-50/30 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 text-blue-650 flex items-center justify-center border border-blue-200/50 shrink-0">
                      <ExternalLink size={22} />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Reference Link</p>
                      <a 
                        href={strValue} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-bold text-slate-800 hover:underline truncate block mt-0.5 min-w-0"
                        title={strValue}
                      >
                        {strValue}
                      </a>
                    </div>
                  </div>
                  <a 
                    href={strValue} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 uppercase tracking-wider w-full sm:w-auto text-center"
                  >
                    Visit Link
                  </a>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
