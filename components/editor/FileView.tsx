import type { VfsFile } from "@/lib/vfs/types";
import CodeView from "./CodeView";
import MarkdownView from "./MarkdownView";

export default async function FileView({ file }: { file: VfsFile }) {
  if (file.lang === "markdown") return <MarkdownView file={file} />;
  return (
    <>
      {/* Every page needs a level-one heading; for a code file it is the file's name. */}
      <h1 className="sr-only">{file.name}</h1>
      <CodeView code={file.content} lang={file.lang} />
    </>
  );
}
