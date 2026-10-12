import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-3 text-2xl font-semibold text-white">404: file not found</h1>
      <p className="mb-4">There is no file at this address. It may have moved when this site was rebuilt.</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Open the <Link href="/" className="text-[#4daafc] underline underline-offset-2">welcome page</Link>.
        </li>
        <li>
          Press <kbd className="rounded-sm border border-[#454545] px-1">Ctrl</kbd> + <kbd className="rounded-sm border border-[#454545] px-1">P</kbd> to search every file by name.
        </li>
        <li>
          Or type <code className="rounded-sm bg-[#2b2b2b] px-1">ls</code> in the terminal below.
        </li>
      </ul>
    </div>
  );
}
