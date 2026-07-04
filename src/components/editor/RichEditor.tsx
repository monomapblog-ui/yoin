"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import { useEffect, useCallback } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({ content, onChange, placeholder = "本文を書く..." }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Typography,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "article-body outline-none min-h-[400px] px-1",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleImageUpload = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (editor && e.target?.result) {
        editor.chain().focus().setImage({ src: e.target.result as string }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      e.preventDefault();
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />
      <div
        className="flex-1 cursor-text"
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <EditorContent editor={editor} />
      </div>
      <div className="text-xs text-gray-400 text-right mt-3 pr-1">
        {charCount.toLocaleString()} 字
      </div>
    </div>
  );
}
