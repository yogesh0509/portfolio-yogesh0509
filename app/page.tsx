import FileView from "@/components/editor/FileView";
import { allFiles } from "@/lib/vfs/load.server";

export default function Home() {
  const welcome = allFiles().find((file) => file.url === "/");
  if (!welcome) throw new Error("The virtual file system has no root README.md");
  return <FileView file={welcome} />;
}
