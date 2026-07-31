import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { API_BASE } from "@/lib/apiConfig";
import { logger } from "@/lib/logger";

type WpEditorProps = {
  value: string;
  onChange: (html: string) => void;
  postId?: string;
};

type HeadingLevel = 0 | 1 | 2 | 3 | 4;

const HEADING_OPTIONS: { value: HeadingLevel; label: string }[] = [
  { value: 0, label: "Paragraf" },
  { value: 1, label: "Heading 1" },
  { value: 2, label: "Heading 2" },
  { value: 3, label: "Heading 3" },
  { value: 4, label: "Heading 4" },
];

export default function WpEditor({ value, onChange, postId }: WpEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"visual" | "code">("visual");
  const [codeValue, setCodeValue] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [, setEditorTick] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Mulai menulis...",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] w-full rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const refreshToolbar = () => setEditorTick((tick) => tick + 1);
    editor.on("selectionUpdate", refreshToolbar);
    editor.on("transaction", refreshToolbar);
    return () => {
      editor.off("selectionUpdate", refreshToolbar);
      editor.off("transaction", refreshToolbar);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  useEffect(() => {
    setCodeValue(value);
  }, [value]);

  const getCurrentHeading = (): HeadingLevel => {
    if (!editor) return 0;
    for (const level of [1, 2, 3, 4] as const) {
      if (editor.isActive("heading", { level })) return level;
    }
    return 0;
  };

  const applyHeading = (level: HeadingLevel) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (level === 0) {
      chain.setParagraph().run();
    } else {
      chain.setHeading({ level }).run();
    }
  };

  const ToolbarButton = ({
    active,
    disabled,
    onClick,
    children,
  }: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded-sm text-xs border transition-colors ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-sm border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded-sm text-xs border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 font-semibold"
          onClick={() => fileInputRef.current?.click()}
          disabled={mode === "code" || uploading}
        >
          {uploading ? "Mengunggah..." : "Unggah Media"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              setUploading(true);
              const token = localStorage.getItem("apident:token");
              const formData = new FormData();
              formData.append("image", file);
              formData.append("collection", "posts");
              if (postId) formData.append("post_id", postId);

              const res = await fetch(`${API_BASE}/admin/media`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Accept": "application/json",
                },
                body: formData,
              });

              if (!res.ok) {
                logger.error("Gagal upload media", await res.text());
                return;
              }

              const data = await res.json();
              const url = data?.url;
              if (!url) return;

              if (mode === "visual") {
                if (!editor) return;
                editor.chain().focus().setImage({ src: url, alt: file.name || "" }).run();
              } else {
                setCodeValue((prevCodeValue) => `${prevCodeValue}<img src="${url}" alt="" />`);
              }
            } catch (err) {
              logger.error("Gagal upload media", err);
            } finally {
              setUploading(false);
              e.currentTarget.value = "";
            }
          }}
        />

        <div className="flex items-center gap-1 mr-2 ml-1">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`px-2 py-1 rounded-sm text-xs border font-semibold ${
              mode === "visual"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`px-2 py-1 rounded-sm text-xs border font-semibold ${
              mode === "code"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Kode
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton
          active={editor?.isActive("bold")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("italic")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <select
          value={getCurrentHeading()}
          disabled={!editor || mode === "code"}
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => applyHeading(Number(e.target.value) as HeadingLevel)}
          className="h-[26px] min-w-[108px] rounded-sm border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Format heading"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ToolbarButton
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          “ ”
        </ToolbarButton>

        <ToolbarButton
          active={editor?.isActive({ textAlign: "left" })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          Left
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "center" })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          Center
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "right" })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          Right
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "justify" })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        >
          Justify
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("codeBlock")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          {'</>'}
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          ─
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={() => {
            if (!editor) return;
            const previousUrl = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Masukkan URL", previousUrl || "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor}
          onClick={() => editor?.chain().focus().unsetLink().run()}
        >
          Unlink
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton
          disabled={!editor || !editor.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor || !editor.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          Redo
        </ToolbarButton>
      </div>
      {mode === "visual" ? (
        <div className="wp-editor-content [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-sm [&_img]:border [&_img]:border-gray-200 [&_img]:my-3">
          <EditorContent editor={editor} />
        </div>
      ) : (
        <textarea
          value={codeValue}
          onChange={(e) => {
            const html = e.target.value;
            setCodeValue(html);
            onChange(html);
          }}
          className="min-h-[320px] w-full rounded-sm border-t border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none"
        />
      )}
    </div>
  );
}
