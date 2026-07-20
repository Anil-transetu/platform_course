import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { X } from 'lucide-react';
import { NodeSelection } from '@tiptap/pm/state';
import { getDisplayMediaUrl } from '@/lib/utils';

const isEmbedUrl = (url: string) => {
  if (!url) return false;
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
};

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
};

const VideoComponent = (props: any) => {
  const src = props.node.attrs.src || "";
  const isEmbed = isEmbedUrl(src);
  const videoUrl = isEmbed ? getEmbedUrl(src) : (getDisplayMediaUrl(src) || "");

  return (
    <NodeViewWrapper className="relative group inline-block max-w-full w-full mt-4 mb-4 select-none">
      <div className="relative pt-[56.25%] w-full rounded-xl overflow-hidden border border-gray-100 dark:border-border/50 shadow-sm bg-black">
        {isEmbed ? (
          <iframe
            src={videoUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <video
            src={videoUrl}
            controls
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        )}
      </div>
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.deleteNode();
        }}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Remove video"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </NodeViewWrapper>
  );
};

const isNearCustomNode = (state: any, name: string, isBackspace: boolean) => {
  const { selection } = state;
  if (selection instanceof NodeSelection) {
    return selection.node.type.name === name;
  }
  
  if (selection.empty) {
    const { $from } = selection;
    
    // Check if the node is at the current depth
    if (isBackspace) {
      if ($from.nodeBefore && $from.nodeBefore.type.name === name) {
        return true;
      }
    } else {
      if ($from.nodeAfter && $from.nodeAfter.type.name === name) {
        return true;
      }
    }
    
    // Check if we are at the boundary of a parent node (e.g. start of a paragraph)
    if (isBackspace && $from.parentOffset === 0) {
      const index = $from.index($from.depth - 1);
      if (index > 0) {
        const parent = $from.node($from.depth - 1);
        const nodeBefore = parent.child(index - 1);
        if (nodeBefore && nodeBefore.type.name === name) {
          return true;
        }
      }
    } else if (!isBackspace && $from.parentOffset === $from.parent.content.size) {
      const index = $from.index($from.depth - 1);
      const parent = $from.node($from.depth - 1);
      if (index < parent.childCount - 1) {
        const nodeAfter = parent.child(index + 1);
        if (nodeAfter && nodeAfter.type.name === name) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const CustomVideo = Node.create({
  name: 'customVideo',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe[src]',
      },
      {
        tag: 'video[src]',
      },
      {
        tag: 'div[data-youtube-video]',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.src && isEmbedUrl(HTMLAttributes.src)) {
      return ['iframe', mergeAttributes(HTMLAttributes)];
    }
    return ['video', mergeAttributes({ controls: '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        if (isNearCustomNode(this.editor.state, this.name, true)) {
          return true; // Prevent default Backspace behavior (deletion)
        }
        return false;
      },
      Delete: () => {
        if (isNearCustomNode(this.editor.state, this.name, false)) {
          return true; // Prevent default Delete behavior (deletion)
        }
        return false;
      },
    };
  },
});
