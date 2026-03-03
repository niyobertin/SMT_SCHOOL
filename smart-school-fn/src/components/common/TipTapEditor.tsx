import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Code2,
    Strikethrough,
    Minus,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Highlighter,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Palette,
    CheckSquare,
    Table as TableIcon,
    Trash2,
    PlusSquare,
    Columns,
    Rows
} from 'lucide-react';

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const sections = [
        {
            label: 'History',
            tools: [
                { icon: <Undo size={14} />, onClick: () => editor.chain().focus().undo().run(), isActive: false, title: 'Undo' },
                { icon: <Redo size={14} />, onClick: () => editor.chain().focus().redo().run(), isActive: false, title: 'Redo' },
            ]
        },
        {
            label: 'Headings',
            tools: [
                { icon: <Heading1 size={14} />, onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), title: 'H1' },
                { icon: <Heading2 size={14} />, onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), title: 'H2' },
                { icon: <Heading3 size={14} />, onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), title: 'H3' },
            ]
        },
        {
            label: 'Basic',
            tools: [
                { icon: <Bold size={14} />, onClick: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), title: 'Bold' },
                { icon: <Italic size={14} />, onClick: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), title: 'Italic' },
                { icon: <UnderlineIcon size={14} />, onClick: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline'), title: 'Underline' },
                { icon: <Strikethrough size={14} />, onClick: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike'), title: 'Strike' },
            ]
        },
        {
            label: 'Alignment',
            tools: [
                { icon: <AlignLeft size={14} />, onClick: () => editor.chain().focus().setTextAlign('left').run(), isActive: editor.isActive({ textAlign: 'left' }), title: 'Left' },
                { icon: <AlignCenter size={14} />, onClick: () => editor.chain().focus().setTextAlign('center').run(), isActive: editor.isActive({ textAlign: 'center' }), title: 'Center' },
                { icon: <AlignRight size={14} />, onClick: () => editor.chain().focus().setTextAlign('right').run(), isActive: editor.isActive({ textAlign: 'right' }), title: 'Right' },
                { icon: <AlignJustify size={14} />, onClick: () => editor.chain().focus().setTextAlign('justify').run(), isActive: editor.isActive({ textAlign: 'justify' }), title: 'Justify' },
            ]
        },
        {
            label: 'Lists',
            tools: [
                { icon: <List size={14} />, onClick: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), title: 'Bullets' },
                { icon: <ListOrdered size={14} />, onClick: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), title: 'Numbers' },
                { icon: <CheckSquare size={14} />, onClick: () => editor.chain().focus().toggleTaskList().run(), isActive: editor.isActive('taskList'), title: 'Tasks' },
            ]
        },
        {
            label: 'Advanced',
            tools: [
                { icon: <SubscriptIcon size={14} />, onClick: () => editor.chain().focus().toggleSubscript().run(), isActive: editor.isActive('subscript'), title: 'Sub' },
                { icon: <SuperscriptIcon size={14} />, onClick: () => editor.chain().focus().toggleSuperscript().run(), isActive: editor.isActive('superscript'), title: 'Super' },
                { icon: <Highlighter size={14} />, onClick: () => editor.chain().focus().toggleHighlight().run(), isActive: editor.isActive('highlight'), title: 'Highlight' },
                { icon: <Palette size={14} />, onClick: () => editor.chain().focus().setColor('#f43f5e').run(), isActive: editor.isActive('textStyle', { color: '#f43f5e' }), title: 'Red' },
            ]
        },
        {
            label: 'Insert',
            tools: [
                { icon: <LinkIcon size={14} />, onClick: addLink, isActive: editor.isActive('link'), title: 'Link' },
                { icon: <ImageIcon size={14} />, onClick: addImage, isActive: false, title: 'Image' },
                { icon: <Minus size={14} />, onClick: () => editor.chain().focus().setHorizontalRule().run(), isActive: false, title: 'Divider' },
            ]
        },
        {
            label: 'Code',
            tools: [
                { icon: <Code size={14} />, onClick: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code'), title: 'Code' },
                { icon: <Code2 size={14} />, onClick: () => editor.chain().focus().toggleCodeBlock().run(), isActive: editor.isActive('codeBlock'), title: 'Code Block' },
            ]
        },
        {
            label: 'Table',
            tools: [
                { icon: <TableIcon size={14} />, onClick: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: false, title: 'New Table' },
                { icon: <PlusSquare size={14} />, onClick: () => editor.chain().focus().addColumnAfter().run(), isActive: false, title: 'Add Col' },
                { icon: <Minus size={14} />, onClick: () => editor.chain().focus().deleteColumn().run(), isActive: false, title: 'Del Col' },
                { icon: <Rows size={14} />, onClick: () => editor.chain().focus().addRowAfter().run(), isActive: false, title: 'Add Row' },
                { icon: <Trash2 size={14} />, onClick: () => editor.chain().focus().deleteTable().run(), isActive: false, title: 'Del Table' },
            ]
        }
    ];

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-50 border-b border-slate-200">
            {sections.map((section, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-0.5 border-r border-slate-200 pr-1 mr-1 last:border-0 last:mr-0 last:pr-0">
                    {section.tools.map((btn, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={btn.onClick}
                            title={btn.title}
                            className={`p-1.5 rounded-md transition-all ${btn.isActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                                }`}
                        >
                            {btn.icon}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

const TipTapEditor = ({ content, onChange, placeholder = 'Start typing...', minHeight = '200px' }: TipTapEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Image,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Highlight,
            Subscript,
            Superscript,
            TextStyle,
            Color,
            TaskList,
            TaskItem.configure({ nested: true }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-slate prose-sm max-w-none focus:outline-none p-6 font-medium text-slate-700 leading-relaxed overflow-y-auto`,
                style: `min-height: ${minHeight}; max-height: 500px;`
            },
        },
    });

    if (editor && editor.getHTML() !== content) {
        editor.commands.setContent(content || '', false);
    }

    return (
        <div className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900/5 transition-all shadow-sm">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <style dangerouslySetInnerHTML={{
                __html: `
        .ProseMirror p.is-editor-empty:first-child::before {
          content: '${placeholder}';
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a; }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #0f172a; }
        .ProseMirror h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: 0.5rem; color: #0f172a; }
        .ProseMirror table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
        .ProseMirror td, .ProseMirror th { min-width: 1em; border: 2px solid #f1f5f9; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }
        .ProseMirror th { font-weight: bold; text-align: left; background-color: #f8fafc; }
        .ProseMirror .selectedCell:after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(200, 200, 255, 0.4); pointer-events: none; }
        .ProseMirror .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background-color: #adf; pointer-events: none; }
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding: 0; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; }
        .ProseMirror ul[data-type="taskList"] li > label { flex: 0 0 auto; user-select: none; margin-right: 0.5rem; }
      `}} />
        </div>
    );
};

export default TipTapEditor;
