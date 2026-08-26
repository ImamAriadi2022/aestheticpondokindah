import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { Mark, mergeAttributes } from "@tiptap/core";
import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

// Custom FontSize Extension for TipTap
export const FontSize = Mark.create({
  name: "fontSize",

  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.size) {
            return {};
          }
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-size",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: any) => {
          return chain().setMark(this.name, { size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

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

const FONT_SIZE_STEPS = ["9px", "10px", "11px", "12px", "13px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"];

const FONT_SIZE_OPTIONS = [
  { value: "", label: "Ukuran Font" },
  { value: "9px", label: "9px (Sangat Kecil)" },
  { value: "10px", label: "10px (Kecil)" },
  { value: "11px", label: "11px" },
  { value: "12px", label: "12px (Standar Dokumen)" },
  { value: "13px", label: "13px" },
  { value: "14px", label: "14px (Normal / Body)" },
  { value: "16px", label: "16px (Sedang)" },
  { value: "18px", label: "18px (Besar)" },
  { value: "20px", label: "20px (Subjudul)" },
  { value: "24px", label: "24px (Judul H2)" },
  { value: "28px", label: "28px (Judul H1)" },
  { value: "32px", label: "32px (Sangat Besar)" },
  { value: "36px", label: "36px (Jumbo)" },
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
      FontSize,
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
        placeholder: "Mulai menulis isi dokumen atau pasal di sini...",
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[340px] w-full rounded-sm border border-gray-200 bg-white p-4 text-sm text-gray-900 outline-none leading-relaxed",
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

  const getCurrentFontSize = (): string => {
    if (!editor) return "";
    const attrs = editor.getAttributes("fontSize");
    return attrs?.size || "";
  };

  const applyFontSize = (size: string) => {
    if (!editor) return;
    if (!size) {
      (editor.commands as any).unsetFontSize();
    } else {
      (editor.commands as any).setFontSize(size);
    }
  };

  const stepFontSize = (direction: "up" | "down") => {
    if (!editor) return;
    const current = getCurrentFontSize() || "14px";
    let index = FONT_SIZE_STEPS.indexOf(current);
    if (index === -1) {
      const num = parseInt(current, 10) || 14;
      index = FONT_SIZE_STEPS.findIndex((s) => parseInt(s, 10) >= num);
      if (index === -1) index = 5; // default 14px
    }

    if (direction === "up" && index < FONT_SIZE_STEPS.length - 1) {
      applyFontSize(FONT_SIZE_STEPS[index + 1]);
    } else if (direction === "down" && index > 0) {
      applyFontSize(FONT_SIZE_STEPS[index - 1]);
    }
  };

  const ToolbarButton = ({
    active,
    disabled,
    onClick,
    title,
    children,
  }: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    title?: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded-sm text-xs border transition-colors cursor-pointer ${
        active
          ? "bg-gray-900 text-white border-gray-900 font-bold"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-sm border border-gray-200 bg-white">
      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-[#FAFAFA]">
        <button
          type="button"
          className="px-2.5 py-1 rounded-sm text-xs border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 font-semibold cursor-pointer shadow-2xs"
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
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
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

        <div className="flex items-center gap-1 mr-1 ml-1">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`px-2 py-1 rounded-sm text-xs border font-semibold cursor-pointer ${
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
            className={`px-2 py-1 rounded-sm text-xs border font-semibold cursor-pointer ${
              mode === "code"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Kode
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Heading Level Dropdown */}
        <select
          value={getCurrentHeading()}
          disabled={!editor || mode === "code"}
          onChange={(e) => applyHeading(Number(e.target.value) as HeadingLevel)}
          className="h-[28px] min-w-[105px] rounded border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-800 outline-none hover:border-gray-400 focus:border-[#8C6B1C] focus:ring-1 focus:ring-[#8C6B1C] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
          aria-label="Format heading"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Font Size Dropdown & Quick Scalers */}
        <div className="flex items-center gap-1">
          <select
            value={getCurrentFontSize()}
            disabled={!editor || mode === "code"}
            onChange={(e) => applyFontSize(e.target.value)}
            className="h-[28px] min-w-[130px] rounded border border-gray-300 bg-white px-2 text-xs font-semibold text-gray-800 outline-none hover:border-gray-400 focus:border-[#8C6B1C] focus:ring-1 focus:ring-[#8C6B1C] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-2xs"
            aria-label="Pilih Ukuran Font"
            title="Pilih besar kecil font teks yang dipilih"
          >
            {FONT_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ToolbarButton
            disabled={!editor || mode === "code"}
            onClick={() => stepFontSize("down")}
            title="Kecilkan Ukuran Font (A-)"
          >
            <span className="font-bold text-[10px]">A-</span>
          </ToolbarButton>

          <ToolbarButton
            disabled={!editor || mode === "code"}
            onClick={() => stepFontSize("up")}
            title="Besarkan Ukuran Font (A+)"
          >
            <span className="font-bold text-[11px]">A+</span>
          </ToolbarButton>

          {getCurrentFontSize() && (
            <ToolbarButton
              disabled={!editor || mode === "code"}
              onClick={() => applyFontSize("")}
              title="Reset ke Ukuran Font Normal"
            >
              <span className="text-[10px] text-rose-600 font-bold">Reset</span>
            </ToolbarButton>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Basic Text Formatting */}
        <ToolbarButton
          active={editor?.isActive("bold")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Tebal (Bold)"
        >
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("italic")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Miring (Italic)"
        >
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("strike")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          title="Coret (Strikethrough)"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        {/* Lists & Quotes */}
        <ToolbarButton
          active={editor?.isActive("bulletList")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Daftar Poin (Bullet List)"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("orderedList")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Daftar Nomor (Numbered List)"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("blockquote")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Kutipan (Blockquote)"
        >
          “ ”
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton
          active={editor?.isActive({ textAlign: "left" })}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Rata Kiri"
        >
          Left
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "center" })}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Rata Tengah"
        >
          Center
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "right" })}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Rata Kanan"
        >
          Right
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "justify" })}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          title="Rata Kanan-Kiri (Justify)"
        >
          Justify
        </ToolbarButton>

        <ToolbarButton
          active={editor?.isActive("codeBlock")}
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          title="Blok Kode"
        >
          {"</>"}
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Garis Pembatas Horizontal"
        >
          ─
        </ToolbarButton>

        {/* Links */}
        <ToolbarButton
          active={editor?.isActive("link")}
          disabled={!editor || mode === "code"}
          onClick={() => {
            if (!editor) return;
            const previousUrl = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Masukkan URL Link:", previousUrl || "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          title="Sisipkan Link"
        >
          Link
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor || mode === "code"}
          onClick={() => editor?.chain().focus().unsetLink().run()}
          title="Hapus Link"
        >
          Unlink
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* History Undo / Redo */}
        <ToolbarButton
          disabled={!editor || mode === "code" || !editor.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo (Urungkan)"
        >
          Undo
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor || mode === "code" || !editor.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo (Ulangi)"
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
          className="min-h-[340px] w-full rounded-sm border-t border-gray-200 bg-white p-4 text-xs font-mono text-gray-900 outline-none leading-relaxed"
          placeholder="Tulis kode HTML langsung di sini..."
        />
      )}
    </div>
  );
}
