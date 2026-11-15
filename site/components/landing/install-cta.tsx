import InstallDialog from "@/examples/landing/install-dialog";

export function InstallCta() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta-copy" data-reveal>
        <h2 id="cta-title" className="landing-display">
          Update,
          <br />
          don’t copy.
        </h2>
        <p className="mt-5 max-w-[40ch] text-lg leading-[1.5] text-pretty">
          The installation guide covers the package and its stylesheet. After that, every new version arrives
          through npm update.
        </p>
      </div>
      <div data-ui className="cta-dialog" data-reveal>
        <InstallDialog />
      </div>
    </section>
  );
}
