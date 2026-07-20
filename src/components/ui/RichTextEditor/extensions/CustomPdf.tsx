import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { X, FileText } from 'lucide-react';
import { NodeSelection } from '@tiptap/pm/state';
import { getDisplayMediaUrl, openPdf } from '@/lib/utils';

const PdfComponent = (props: any) => {
  return (
    <NodeViewWrapper className="relative group inline-block max-w-full w-full mt-4 mb-4 select-none">
      <div className="flex items-center gap-4 p-4 border border-red-100 dark:border-red-950/30 rounded-2xl bg-red-50/30 dark:bg-red-950/10 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
          <FileText size={24} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">{props.node.attrs.title || "Attached PDF Resource"}</p>
          <button 
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-block mt-0.5 text-left"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openPdf(props.node.attrs.src);
            }}
          >
            Download / View PDF
          </button>
        </div>
      </div>
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.deleteNode();
        }}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
        title="Remove PDF"
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

export const CustomPdf = Node.create({
  name: 'customPdf',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: 'Attached PDF Resource',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-pdf-resource]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('src'),
            title: element.getAttribute('title') || 'Attached PDF Resource',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-pdf-resource': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfComponent);
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
