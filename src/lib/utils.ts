import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ContentBlock } from "@/store/useCourseStore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSentenceCase(str: string): string {
  if (!str) return "";

  const acronyms = new Set(["HTML", "CSS", "JS", "UI", "UX", "API", "SQL", "AI", "ML", "PHP", "AWS"]);

  if (str !== str.toUpperCase()) {
    return str;
  }

  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      const upperWord = word.toUpperCase();
      if (acronyms.has(upperWord)) {
        return upperWord;
      }
      if (["&", "and", "or", "in", "of", "on", "to", "for", "with"].includes(word) && index !== 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function getDisplayThumbnailUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // Extract base64 DataURL if it is wrapped inside a prepended URL from the backend
  const dataUrlIndex = url.indexOf('data:image/');
  if (dataUrlIndex !== -1) {
    return url.substring(dataUrlIndex);
  }

  // If it starts with a relative path (e.g. "uploads/"), prepend the correct api host
  if (!url.startsWith('http') && !url.startsWith('data:')) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return `${apiHost.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  // If it points to port 5000 (which is the backend fallback), map it to the correct port (5001)
  if (url.startsWith('http://localhost:5000/')) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    return url.replace('http://localhost:5000', apiHost.replace(/\/$/, ''));
  }

  return url;
}

export function getDisplayMediaUrl(url?: string): string | undefined {
  if (!url) return undefined;

  // Extract base64 DataURL if it is wrapped inside a prepended URL from the backend
  const dataUrlIndex = url.indexOf('data:');
  if (dataUrlIndex !== -1) {
    return url.substring(dataUrlIndex);
  }

  // If it is already an absolute HTTP/S URL, or starts with data:, return it
  if (url.startsWith('http') || url.startsWith('data:')) {
    // If it points to port 5000 (which is the backend fallback), map it to the correct port (5001)
    if (url.startsWith('http://localhost:5000/')) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      return url.replace('http://localhost:5000', apiHost.replace(/\/$/, ''));
    }
    return url;
  }

  // If it starts with a relative path (e.g. "uploads/"), prepend the correct api host
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  return `${apiHost.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

export function openPdf(url?: string) {
  if (!url) return;
  const resolved = getDisplayMediaUrl(url);
  if (!resolved) return;

  if (resolved.startsWith('data:')) {
    try {
      const parts = resolved.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const base64Data = parts[1];
      const raw = window.atob(base64Data);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error("Error opening base64 PDF:", error);
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`<iframe src="${resolved}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  } else {
    window.open(resolved, '_blank');
  }
}

export function mapCourseDetailsToStore(detail: Record<string, any>) {
  const cleanThumbnail = (url?: string): string => {
    if (!url) return "";
    const dataUrlIndex = url.indexOf("data:image/");
    if (dataUrlIndex !== -1 && url.startsWith("http")) {
      return url.substring(dataUrlIndex);
    }
    return url || "";
  };

  const domainObj = typeof detail.domain === "object" && detail.domain !== null ? detail.domain : null;
  const domain =
    domainObj
      ? domainObj.name || domainObj.domain_name || ""
      : typeof detail.domain === "string"
        ? detail.domain
        : detail.domain_name ||
          (typeof detail.category === "object" ? detail.category?.name : detail.category) ||
          "";

  const rawDomainId = detail.domain_id ?? domainObj?.id ?? (typeof detail.domain === "number" ? detail.domain : null);
  const domain_id = rawDomainId !== null && rawDomainId !== undefined && rawDomainId !== "" ? Number(rawDomainId) : null;

  const tags = Array.isArray(detail.tags)
    ? detail.tags.filter(Boolean).map((tag: any) => String(tag).trim())
    : typeof detail.tags === "string"
      ? detail.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  const finalAssessment = detail.final_assessment || detail.finalAssessment || detail.final_assignment || null;
  const finalAssessmentId = detail.final_assessment_id ?? detail.finalAssessment?.id ?? detail.final_assessment?.id ?? detail.final_assignment?.id ?? null;

  return {
    id: detail.id !== undefined ? String(detail.id) : undefined,
    title: detail.title || detail.name || "",
    description: detail.description || "",
    thumbnail_url: cleanThumbnail(detail.thumbnail_url),
    domain,
    domain_id,
    tags,
    status: detail.status || "draft",
    final_assessment: finalAssessment,
    final_assessment_id: finalAssessmentId !== null ? String(finalAssessmentId) : null,
  };
}

export function mapModuleDetailToUpdates(detail: Record<string, any>) {
  const content_blocks = detail.content_blocks || [];
  const description =
    detail.description ||
    detail.content_text ||
    detail.text ||
    (content_blocks.length > 0 ? reconstructHtmlFromContentBlocks(content_blocks) : "");

  return {
    description,
    content_blocks,
    content_text: detail.content_text || description,
    text: detail.text || description,
    image_url: detail.image_url || "",
    video_url: detail.video_url || "",
    pdf_url: detail.pdf_url || "",
    url: detail.url || "",
  };
}

export function mapLessonDetailToUpdates(detail: Record<string, any>) {
  const content_blocks = detail.content_blocks || [];
  const content =
    detail.content_text ||
    detail.content ||
    detail.text ||
    (content_blocks.length > 0 ? reconstructHtmlFromContentBlocks(content_blocks) : "");

  return {
    title: detail.title || detail.name || '',
    content,
    content_blocks,
    content_text: detail.content_text || content,
    text: detail.text || content,
    image_url: detail.image_url || "",
    video_url: detail.video_url || "",
    pdf_url: detail.pdf_url || "",
    url: detail.url || "",
    images: detail.images || [],
    videos: detail.videos || [],
    pdfs: detail.pdfs || [],
    urls: detail.urls || [],
  };
}

export function mapTopicDetailToUpdates(detail: Record<string, any>) {
  const content_blocks = detail.content_blocks || [];
  const content =
    detail.content_text ||
    detail.content ||
    detail.text ||
    (content_blocks.length > 0 ? reconstructHtmlFromContentBlocks(content_blocks) : "");

  return {
    content,
    content_blocks,
    content_text: detail.content_text || content,
    text: detail.text || content,
    image_url: detail.image_url || "",
    video_url: detail.video_url || "",
    pdf_url: detail.pdf_url || "",
    url: detail.url || "",
  };
}

export function getDefaultEditorRoute(
  courseId: string | number,
  state: { activeModuleId: string | null; activeLessonId: string | null; activeTopicId: string | null }
): string {
  const base = `/admin/courses/edit/${courseId}`;
  if (state.activeTopicId) return `${base}/topic`;
  if (state.activeLessonId) return `${base}/lesson`;
  if (state.activeModuleId) return `${base}/module`;
  return base;
}

export function reconstructHtmlFromContentBlocks(blocks?: any[]): string {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return "";
  }

  const sortedBlocks = [...blocks]
    .filter(block => block && typeof block === 'object')
    .sort((a, b) => (Number(a.order_num) || 0) - (Number(b.order_num) || 0));

  return sortedBlocks
    .map((block) => {
      const type = block.type;
      const value = block.value;
      if (value === undefined || value === null) return "";
      
      const strValue = String(value);

      switch (type) {
        case "text":
          if (strValue.trim().startsWith("<") && strValue.trim().endsWith(">")) {
            return strValue;
          }
          return `<p>${strValue}</p>`;
        case "image":
          return `<img src="${strValue}" />`;
        case "video":
          return `<iframe src="${strValue}"></iframe>`;
        case "pdf":
          return `<div data-pdf-resource src="${strValue}" title="PDF Resource"></div>`;
        case "url":
          return `<p><a href="${strValue}">${strValue}</a></p>`;
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n");
}

export function parseHtmlToContentBlocks(html: string): Omit<ContentBlock, 'id'>[] {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");
  const blocks: Omit<ContentBlock, 'id'>[] = [];
  
  const children = Array.from(doc.body.children);
  
  children.forEach((child) => {
    // 1. Check if image
    if (child.tagName === 'IMG') {
      const src = child.getAttribute('src') || '';
      blocks.push({
        type: 'image',
        value: src,
        order_num: 0
      });
      return;
    }
    
    // 2. Check if video
    if (child.tagName === 'IFRAME' || child.tagName === 'VIDEO') {
      const src = child.getAttribute('src') || '';
      blocks.push({
        type: 'video',
        value: src,
        order_num: 0
      });
      return;
    }
    
    // 3. Check if PDF
    if (child.tagName === 'DIV' && child.hasAttribute('data-pdf-resource')) {
      const src = child.getAttribute('src') || '';
      blocks.push({
        type: 'pdf',
        value: src,
        order_num: 0
      });
      return;
    }
    
    // 4. Check if URL block
    if (child.tagName === 'P') {
      const nonWhitespaceNodes = Array.from(child.childNodes).filter(node => {
        if (node.nodeType === 3) { // Text node
          return (node.textContent || '').trim().length > 0;
        }
        return true;
      });
      
      if (nonWhitespaceNodes.length === 1 && nonWhitespaceNodes[0].nodeType === 1) {
        const singleElement = nonWhitespaceNodes[0] as HTMLElement;
        if (singleElement.tagName === 'A' && singleElement.hasAttribute('href')) {
          const href = singleElement.getAttribute('href') || '';
          blocks.push({
            type: 'url',
            value: href,
            order_num: 0
          });
          return;
        }
      }
    }
    
    // 5. Default: treat as text block
    blocks.push({
      type: 'text',
      value: child.outerHTML,
      order_num: 0
    });
  });
  
  // Assign order_num sequentially starting from 1
  return blocks.map((block, index) => ({
    ...block,
    order_num: index + 1
  }));
}

export function matchBlocksWithIds(
  newBlocks: Omit<ContentBlock, 'id'>[],
  originalBlocks: ContentBlock[]
): ContentBlock[] {
  if (!originalBlocks || originalBlocks.length === 0) {
    return newBlocks as ContentBlock[];
  }

  const result: ContentBlock[] = [];
  const usedOriginalIndices = new Set<number>();

  newBlocks.forEach((newBlock) => {
    // Try to find an exact match first (same type and value)
    let matchedIndex = -1;
    for (let i = 0; i < originalBlocks.length; i++) {
      if (usedOriginalIndices.has(i)) continue;
      const orig = originalBlocks[i];
      if (orig.type === newBlock.type && orig.value === newBlock.value) {
        matchedIndex = i;
        break;
      }
    }

    // If no exact match, try to find a match of the same type sequentially
    if (matchedIndex === -1) {
      for (let i = 0; i < originalBlocks.length; i++) {
        if (usedOriginalIndices.has(i)) continue;
        const orig = originalBlocks[i];
        if (orig.type === newBlock.type) {
          matchedIndex = i;
          break;
        }
      }
    }

    if (matchedIndex !== -1) {
      usedOriginalIndices.add(matchedIndex);
      const matchedOrig = originalBlocks[matchedIndex];
      result.push({
        ...newBlock,
        id: matchedOrig.id
      } as ContentBlock);
    } else {
      // New block, no ID
      result.push(newBlock as ContentBlock);
    }
  });

  return result;
}
