import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "cennge-ui";
import { BrandMark } from "@/components/brand-mark";
import { Search } from "@/components/search";

export const metadata: Metadata = { title: "Not in the docs" };

/** Any address with no page: the static host serves this as 404.html. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col px-4 sm:px-6 lg:px-10">
      <header className="flex h-14 items-center">
        <Link href="/" prefetch={false} className="inline-flex items-center gap-2 text-lg font-bold tracking-[-0.015em]">
          <BrandMark />
          cennge-ui
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 pb-24">
        <h1 className="text-[2.5rem] leading-[1.15] font-bold tracking-[-0.025em] max-sm:text-[2rem]">Not in the docs</h1>
        <p className="text-lg text-pretty">
          No page lives at this address. Search for the component or guide you were after, or start from the introduction.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-[21rem]">
            <Search shrinksOnPhones={false} />
          </div>
          <Button asChild color="primary">
            <Link href="/docs/introduction/">Introduction</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
