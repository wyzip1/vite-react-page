import React, { forwardRef, ForwardedRef, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

interface KotlinDarkEditorProps {}

function debounce(event: Function, delay = 300) {
  let timer: number = -1;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(event, delay);
  };
}

const KotlinDarkEditor = (
  _props: KotlinDarkEditorProps,
  ref: ForwardedRef<IStandaloneCodeEditor>
) => {
  const editorRef = useRef<IStandaloneCodeEditor>();
  function editorMounted(editor: IStandaloneCodeEditor) {
    if (typeof ref === "function") ref(editor);
    else if (ref !== null) ref.current = editor;
    editorRef.current = editor;
  }

  const saveCatchValue = debounce(() => {
    const value = editorRef.current?.getValue();
    localStorage.setItem("catch_value", value || "");
  });

  const defaultContent = localStorage.getItem("catch_value") || "";

  useEffect(() => {
    const preventSave = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") e.preventDefault();
    };
    window.addEventListener("keydown", preventSave);
    return () => window.removeEventListener("keydown", preventSave);
  }, []);

  return (
    <Editor
      width="100%"
      height="calc(100vh - 70px)"
      theme="vs-dark"
      defaultLanguage="groovy"
      defaultValue={defaultContent}
      onMount={editorMounted}
      onChange={saveCatchValue}
    />
  );
};

export default forwardRef<IStandaloneCodeEditor>(KotlinDarkEditor);
