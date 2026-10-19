import { useState } from "react";
import { Carousel, CarouselContent, CarouselControls, CarouselDots, CarouselItem } from "cennge-ui";

const releases = ["v0.5.0 Carousel", "v0.4.0 Rating", "v0.3.0 Table", "v0.2.0 Calendar", "v0.1.0 First release"];
const repositories = ["cennge-ui", "ai-niche-scout", "playground", "docs", "tokens", "icons", "examples"];
const tips = ["Press Ctrl K for commands", "Drag the slides with a mouse", "Every colour is a CSS variable"];

function Card({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex h-36 flex-col justify-between rounded-large bg-surface-3 p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export default function CarouselFixture() {
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState("");

  return (
    <>
      <button type="button">Before</button>

      <Carousel aria-label="Releases" index={index} onIndexChange={setIndex} className="w-full max-w-xl">
        <CarouselContent>
          {releases.map((release) => (
            <CarouselItem key={release}>
              <Card title={release}>
                <a
                  href={`#${release}`}
                  className="self-start text-sm text-primary-text underline"
                  onClick={(event) => {
                    event.preventDefault();
                    setOpened(release);
                  }}
                >
                  Release notes
                </a>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls />
      </Carousel>
      <p>
        index: <span data-testid="index">{index}</span> · opened: <span data-testid="opened">{opened}</span>
      </p>
      <button type="button" onClick={() => setIndex(releases.length - 1)}>
        Last release
      </button>

      <Carousel aria-label="Repositories" slidesPerView={2} gap="0.75rem" className="w-full max-w-xl">
        <CarouselContent>
          {repositories.map((name) => (
            <CarouselItem key={name}>
              <Card title={name} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls />
      </Carousel>

      <Carousel aria-label="Tips" autoplay={1500} loop className="w-full max-w-xl">
        <CarouselContent>
          {tips.map((tip) => (
            <CarouselItem key={tip}>
              <Card title={tip} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselControls />
      </Carousel>

      <Carousel aria-label="Pinned" className="w-full max-w-xl">
        <CarouselContent>
          <CarouselItem>
            <Card title="Only one slide" />
          </CarouselItem>
        </CarouselContent>
        <CarouselControls />
      </Carousel>

      <Carousel aria-label="Screenshots" className="w-full max-w-xl">
        <CarouselContent arrows>
          {["bg-primary", "bg-secondary", "bg-success"].map((tone, i) => (
            <CarouselItem key={tone}>
              <div className={`h-40 rounded-large ${tone}`} role="img" aria-label={`Screenshot ${i + 1}`} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>

      <button type="button">After</button>
    </>
  );
}
