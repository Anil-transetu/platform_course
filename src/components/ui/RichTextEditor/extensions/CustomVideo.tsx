import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { X } from 'lucide-react';

const VideoComponent = (props: any) => {
  return (
    <NodeViewWrapper className="relative group inline-block max-w-full w-full mt-4 mb-4">
      <div className="relative pt-[56.25%] w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <iframe
          src={props.node.attrs.src}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      
      <button
        type="button"
        onClick={() => props.deleteNode()}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Remove video"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </NodeViewWrapper>
  );
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
        tag: 'div[data-youtube-video]',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoComponent);
  },
});
