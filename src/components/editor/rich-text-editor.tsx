import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import MenuBar from "./menu-bar";

interface RichTextEditorProps {
	content: JSONContent;
	onChange: (jsonContent: JSONContent) => void;
}

export default function RichTextEditor({
	content,
	onChange,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight,
			Placeholder.configure({
                placeholder: "Enter your content...",
                emptyEditorClass: "is-empty-editor",
            }),
        ],
        content: content,
		editorProps: {
			attributes: {
                class: "focus:outline-none p-3 editor-content h-full w-full"
            },
		},
		onUpdate: ({ editor }) => {
			const json = editor.getJSON();
			const cleanJson = JSON.parse(JSON.stringify(json));
			onChange(cleanJson);
		},
		immediatelyRender: false,
	});

	return (
		<div className="h-full ">
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
}
