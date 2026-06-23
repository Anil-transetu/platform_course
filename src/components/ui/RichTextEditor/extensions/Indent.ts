import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem'],
      minIndent: 0,
      maxIndent: 8,
      indentSize: 24, // in px
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: null,
            parseHTML: element => {
              const indentAttr = element.getAttribute('data-indent');
              return indentAttr ? parseInt(indentAttr, 10) : null;
            },
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {};
              }
              return {
                'data-indent': attributes.indent,
                style: `padding-left: ${attributes.indent * this.options.indentSize}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;
        let isUpdated = false;

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < this.options.maxIndent) {
              const nextIndent = currentIndent + 1;
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: nextIndent,
                });
              }
              isUpdated = true;
            }
            return false;
          }
        });
        return isUpdated;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        const { from, to } = selection;
        let isUpdated = false;

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > this.options.minIndent) {
              const nextIndent = currentIndent - 1;
              if (dispatch) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  indent: nextIndent > 0 ? nextIndent : null,
                });
              }
              isUpdated = true;
            }
            return false;
          }
        });
        return isUpdated;
      },
    };
  },
});
