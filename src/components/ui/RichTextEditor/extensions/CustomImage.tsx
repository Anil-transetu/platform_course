import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { X } from 'lucide-react';
import { NodeSelection } from '@tiptap/pm/state';
import { getDisplayMediaUrl } from '@/lib/utils';

const ImageComponent = (props: any) => {
  return (
    <NodeViewWrapper className="relative group inline-block max-w-full select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getDisplayMediaUrl(props.node.attrs.src)}
        alt={props.node.attrs.alt}
        className="rounded-xl border border-gray-100 dark:border-border/50 shadow-sm max-w-full h-auto mt-4 mb-4"
      />
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.deleteNode();
        }}
        className="absolute top-6 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Remove image"
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
