import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './extensions/CustomImage';
import { CustomVideo } from './extensions/CustomVideo';
import { CustomPdf } from './extensions/CustomPdf';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from './extensions/FontSize';
import { Indent } from './extensions/Indent';
import React, { useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Undo, 
  Redo, 
  Eraser, 
  ChevronDown, 
  Indent as IndentIcon, 
  Outdent as OutdentIcon,
  Code,
  Palette,
  Paintbrush,
  Check
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export interface RichTextEditorRef {
  insertImage: (url: string) => void;
  insertVideo: (url: string) => void;
  insertPdf: (url: string, title: string) => void;
  insertLink: (url: string, title: string) => void;
}

const FONTS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Calibri', value: 'Calibri' },
  { label: 'Cambria', value: 'Cambria' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Merriweather', value: 'Merriweather' }
];

const FONT_SIZES = [
  { label: '8px', value: '8px' },
  { label: '9px', value: '9px' },
  { label: '10px', value: '10px' },
  { label: '11px', value: '11px' },
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '48px', value: '48px' },
  { label: '60px', value: '60px' },
  { label: '72px', value: '72px' }
];

const HEADINGS = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' }
];

const COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Black', value: '#000000' },
  { name: 'Gray', value: '#4b5563' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
];

const HIGHLIGHTS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Red', value: '#fecaca' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Pink', value: '#fbcfe8' },
];

// Custom dropdown component using standard elements
interface DropdownSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
  className?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  options,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find(o => o.value === value) || { label, value };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/10"
      >
        <span className="truncate flex-1 text-left">{activeOption.label}</span>
        <ChevronDown size={12} className="text-slate-400 shrink-0 ml-0.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 w-56 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 focus:outline-none">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected 
                    ? 'bg-blue-50/60 font-bold text-blue-600' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                style={{
                  fontFamily: options === FONTS ? option.value : undefined,
                }}
              >
                <span className={
                  isSelected ? '' :
                  option.value === 'h1' ? 'text-base font-extrabold text-slate-800' :
                  option.value === 'h2' ? 'text-sm font-bold text-slate-800' :
                  option.value === 'h3' ? 'text-xs font-bold text-slate-800' :
                  option.value === 'h4' ? 'text-xs font-semibold text-slate-880' :
                  'text-xs font-normal'
                }>
                  {option.label}
                </span>
                {isSelected && <Check size={12} className="text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Custom color picker dropdown
interface ColorDropdownProps {
  icon: React.ReactNode;
  colors: { name: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  tooltip: string;
}

const ColorDropdown: React.FC<ColorDropdownProps> = ({
  icon,
  colors,
  value,
  onChange,
  tooltip
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        title={tooltip}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-md hover:bg-white hover:shadow-xs transition-all text-slate-400 hover:text-blue-600 focus:outline-none"
      >
        {icon}
        <div 
          className="w-3.5 h-3.5 rounded-full border border-slate-200" 
          style={{ backgroundColor: value === 'inherit' || value === 'transparent' ? 'transparent' : value }}
        />
        <ChevronDown size={10} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-lg grid grid-cols-5 gap-1 min-w-[140px]">
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(c.value);
                setIsOpen(false);
              }}
              title={c.name}
              className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 focus:outline-none flex items-center justify-center ${
                value === c.value 
                  ? 'border-blue-600 scale-105 shadow-sm' 
                  : 'border-slate-200'
              }`}
              style={{ 
                backgroundColor: c.value === 'inherit' || c.value === 'transparent' ? 'transparent' : c.value,
              }}
            >
              {(c.value === 'inherit' || c.value === 'transparent') && (
                <span className="text-[10px] text-red-500 font-bold">/</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder, className }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        CustomImage,
        CustomVideo,
        CustomPdf,
        Link.configure({ openOnClick: false }),
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        TextStyle,
        Color,
        FontFamily,
        FontSize,
        Indent,
      ],
      content: value,
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
      editorProps: {
        attributes: {
          class: 'prose focus:outline-none max-w-none min-h-[350px] p-6 text-sm text-slate-800',
        },
      },
    });

    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        if (editor) {
          editor.commands.insertContent(`<img src="${url}" />`);
        }
      },
      insertVideo: (url: string) => {
        if (editor) {
          editor.commands.insertContent(`<iframe src="${url}"></iframe>`);
        }
      },
      insertPdf: (url: string, title: string) => {
        if (editor) {
          editor.commands.insertContent(`<div data-pdf-resource src="${url}" title="${title}"></div>`);
        }
      },
      insertLink: (url: string, title: string) => {
        if (editor) {
          editor.chain().focus().setLink({ href: url }).insertContent(title).run();
        }
      }
    }));

    useEffect(() => {
      if (!editor) return;
      
      // Update editor content only if it is different and the editor is not focused.
      // This preserves user selections, active styles, and list editing contexts.
      if (value !== editor.getHTML() && !editor.isFocused) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);


    if (!editor) {
      return null;
    }

    const ToolbarButton = ({ 
      isActive, 
      onClick, 
      disabled = false,
      tooltip,
      children 
    }: { 
      isActive?: boolean; 
      onClick: () => void; 
      disabled?: boolean;
      tooltip?: string;
      children: React.ReactNode;
    }) => (
      <button
        type="button"
        title={tooltip}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        disabled={disabled}
        className={`p-2 rounded-md hover:bg-white hover:shadow-xs transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed ${
          isActive ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-blue-600'
        }`}
      >
        {children}
      </button>
    );

    // Helper to determine heading dropdown active value
    const getHeadingValue = () => {
      if (editor.isActive('heading', { level: 1 })) return 'h1';
      if (editor.isActive('heading', { level: 2 })) return 'h2';
      if (editor.isActive('heading', { level: 3 })) return 'h3';
      if (editor.isActive('heading', { level: 4 })) return 'h4';
      if (editor.isActive('heading', { level: 5 })) return 'h5';
      if (editor.isActive('heading', { level: 6 })) return 'h6';
      return 'paragraph';
    };

    const handleHeadingChange = (val: string) => {
      if (val === 'paragraph') {
        editor.chain().focus().setParagraph().run();
      } else {
        const level = parseInt(val.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
        editor.chain().focus().toggleHeading({ level }).run();
      }
    };

    const activeFont = editor.getAttributes('textStyle').fontFamily || '';
    const activeFontSize = editor.getAttributes('textStyle').fontSize || '';
    const activeColor = editor.getAttributes('textStyle').color || 'inherit';
    // Highlight extension stores highlight as attributes or marks, check if active
    const activeHighlight = editor.getAttributes('highlight').color || 'transparent';

    return (
      <div className={`border rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.01)] bg-white flex flex-col transition-all ${
        editor.isFocused 
          ? 'border-blue-500 ring-4 ring-blue-500/10' 
          : 'border-slate-205'
      } ${className || ''}`}>
        
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 shrink-0 rounded-t-xl">
            {/* History */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().undo().run()} 
              disabled={!editor.can().undo()}
              tooltip="Undo"
            >
              <Undo size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().redo().run()} 
              disabled={!editor.can().redo()}
              tooltip="Redo"
            >
              <Redo size={16} />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            {/* Heading */}
            <DropdownSelect
              label="Heading"
              value={getHeadingValue()}
              options={HEADINGS}
              onChange={handleHeadingChange}
              className="w-[100px]"
            />

            {/* Font Family */}
            <DropdownSelect
              label="Font Family"
              value={activeFont}
              options={FONTS}
              onChange={(font) => editor.chain().focus().setFontFamily(font).run()}
              className="w-[130px]"
            />

            {/* Font Size */}
            <DropdownSelect
              label="Size"
              value={activeFontSize}
              options={FONT_SIZES}
              onChange={(size) => editor.chain().focus().setFontSize(size).run()}
              className="w-[80px]"
            />

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            {/* Inline Marks */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              isActive={editor.isActive('bold')}
              tooltip="Bold"
            >
              <Bold size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              isActive={editor.isActive('italic')}
              tooltip="Italic"
            >
              <Italic size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleUnderline().run()} 
              isActive={editor.isActive('underline')}
              tooltip="Underline"
            >
              <UnderlineIcon size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleStrike().run()} 
              isActive={editor.isActive('strike')}
              tooltip="Strikethrough"
            >
              <Strikethrough size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleCode().run()} 
              isActive={editor.isActive('code')}
              tooltip="Inline Code"
            >
              <Code size={16} />
            </ToolbarButton>

            {/* Colors */}
            <ColorDropdown 
              icon={<Palette size={16} />}
              colors={COLORS}
              value={activeColor}
              onChange={(color) => {
                if (color === 'inherit') {
                  editor.chain().focus().unsetColor().run();
                } else {
                  editor.chain().focus().setColor(color).run();
                }
              }}
              tooltip="Text Color"
            />

            <ColorDropdown 
              icon={<Paintbrush size={16} />}
              colors={HIGHLIGHTS}
              value={activeHighlight}
              onChange={(color) => {
                if (color === 'transparent') {
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor.chain().focus().setHighlight({ color }).run();
                }
              }}
              tooltip="Highlight Color"
            />

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            {/* Alignments */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('left').run()} 
              isActive={editor.isActive({ textAlign: 'left' })}
              tooltip="Align Left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('center').run()} 
              isActive={editor.isActive({ textAlign: 'center' })}
              tooltip="Align Center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('right').run()} 
              isActive={editor.isActive({ textAlign: 'right' })}
              tooltip="Align Right"
            >
              <AlignRight size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
              isActive={editor.isActive({ textAlign: 'justify' })}
              tooltip="Justify"
            >
              <AlignJustify size={16} />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            {/* Lists */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBulletList().run()} 
              isActive={editor.isActive('bulletList')}
              tooltip="Bullet List"
            >
              <List size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleOrderedList().run()} 
              isActive={editor.isActive('orderedList')}
              tooltip="Numbered List"
            >
              <ListOrdered size={16} />
            </ToolbarButton>

            {/* Indent / Outdent */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().outdent().run()} 
              tooltip="Decrease Indent"
            >
              <OutdentIcon size={16} />
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().indent().run()} 
              tooltip="Increase Indent"
            >
              <IndentIcon size={16} />
            </ToolbarButton>

            <div className="w-[1px] h-6 bg-slate-200 mx-1" />

            {/* Actions */}
            <ToolbarButton 
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} 
              tooltip="Clear Formatting"
            >
              <Eraser size={16} />
            </ToolbarButton>
          </div>
        
        {/* TEXTAREA CONTENT */}
        <div 
          className="bg-white text-slate-800 flex-1 overflow-y-auto cursor-text rounded-b-xl" 
          onClick={() => editor.commands.focus()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
