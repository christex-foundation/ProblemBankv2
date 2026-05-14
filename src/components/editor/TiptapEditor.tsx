'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { stashPendingFile } from '@/lib/cloudinary-client';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[160px] p-3 focus:outline-none [&_p]:my-1',
        'data-placeholder': placeholder ?? '',
      },
    },
  });

  // Keep the editor in sync if the parent resets `value` programmatically
  // (e.g. after a successful submit clears the form).
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const insertImage = () => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const blobUrl = URL.createObjectURL(file);
      stashPendingFile(blobUrl, file);
      editor.chain().focus().setImage({ src: blobUrl, alt: file.name }).run();
    };
    input.click();
  };

  const setLink = () => {
    if (!editor) return;
    const url = window.prompt('URL');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="border rounded">
      <div className="border-b p-2 flex flex-wrap gap-2 text-sm bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          1. List
        </button>
        <button type="button" onClick={setLink} className="px-2 py-1 rounded">
          Link
        </button>
        <button type="button" onClick={insertImage} className="px-2 py-1 rounded">
          Image
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
