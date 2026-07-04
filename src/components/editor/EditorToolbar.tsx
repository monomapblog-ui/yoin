"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link2, ImagePlus, Undo, Redo,
} from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: (file: File) => void;
}

interface ToolButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolButton({ onClick, active, disabled, title, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-colors text-gray-500 hover:text-gray-800 hover:bg-gray-100 disabled:opacity-30 disabled:pointer-events-none",
        active && "bg-gray-100 text-gray-900"
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, onImageUpload }: EditorToolbarProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("URLを入力してください");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap border-b border-gray-200 pb-2 mb-4">
      <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="元に戻す">
        <Undo className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="やり直す">
        <Redo className="w-4 h-4" />
      </ToolButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="見出し2">
        <Heading2 className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="見出し3">
        <Heading3 className="w-4 h-4" />
      </ToolButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="太字">
        <Bold className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="斜体">
        <Italic className="w-4 h-4" />
      </ToolButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="箇条書き">
        <List className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="番号リスト">
        <ListOrdered className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="引用">
        <Quote className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="区切り線">
        <Minus className="w-4 h-4" />
      </ToolButton>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      <ToolButton onClick={setLink} active={editor.isActive("link")} title="リンク">
        <Link2 className="w-4 h-4" />
      </ToolButton>
      <ToolButton onClick={() => imageInputRef.current?.click()} title="画像">
        <ImagePlus className="w-4 h-4" />
      </ToolButton>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImageUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
