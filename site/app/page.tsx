import "@/components/landing/landing.css";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Dependencies } from "@/components/landing/dependencies";
import { LandingFooter } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { InstallCta } from "@/components/landing/install-cta";
import { Proof } from "@/components/landing/proof";
import { Reveal } from "@/components/landing/reveal";
import { Showcase } from "@/components/landing/showcase";
import { UpdateStory } from "@/components/landing/update-story";
import { Weight } from "@/components/landing/weight";

// The version the page describes: the library's own package.json, read at build time.
const { version } = JSON.parse(readFileSync(join(process.cwd(), "../package.json"), "utf8")) as { version: string };
// Its releases: one "## x.y.z" heading each in the changelog.
const releases = readFileSync(join(process.cwd(), "../CHANGELOG.md"), "utf8").match(/^## \d+\.\d+\.\d+/gm)?.length ?? 0;

export default function Home() {
  return (
    <div className="landing">
      <main>
        <Hero />
        <Showcase />
        <UpdateStory releases={releases} version={version} />
        <Proof />
        <Weight />
        <Dependencies />
        <InstallCta />
      </main>
      <LandingFooter version={version} />
      <Reveal />
    </div>
  );
}
