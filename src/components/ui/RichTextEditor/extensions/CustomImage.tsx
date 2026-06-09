import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { X } from 'lucide-react';

const ImageComponent = (props: any) => {
  return (
    <NodeViewWrapper className="relative group inline-block max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.node.attrs.src}
        alt={props.node.attrs.alt}
        className="rounded-xl border border-gray-100 shadow-sm max-w-full h-auto mt-4 mb-4"
      />
      
      <button
        type="button"
        onClick={() => props.deleteNode()}
        className="absolute top-6 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Remove image"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </NodeViewWrapper>
  );
};

export const CustomImage = Node.create({
  name: 'customImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
