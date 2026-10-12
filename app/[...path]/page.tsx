import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FileView from "@/components/editor/FileView";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { describeFile } from "@/lib/vfs/describe";
import { allFiles } from "@/lib/vfs/load.server";

// Every page comes from the virtual file system; anything else is a real 404.
export const dynamicParams = false;

const files = () => allFiles().filter((file) => file.url !== "/");

export function generateStaticParams() {
  return files().map((file) => ({ path: file.url.slice(1).split("/") }));
}

async function fileFor(params: Promise<{ path: string[] }>) {
  const { path } = await params;
  const url = "/" + path.join("/");
  return files().find((file) => file.url === url) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const file = await fileFor(params);
  if (!file) return {};
  const description = describeFile(file);
  return {
    title: file.name,
    description,
    alternates: { canonical: file.url },
    openGraph: { type: "article", title: file.name, description, url: `${SITE_URL}${file.url}`, siteName: SITE_NAME },
    twitter: { card: "summary", title: file.name, description },
  };
}

export default async function Page({ params }: { params: Promise<{ path: string[] }> }) {
  const file = await fileFor(params);
  if (!file) notFound();
  return <FileView file={file} />;
}
