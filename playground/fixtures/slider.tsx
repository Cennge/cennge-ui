import { useState } from "react";
import { Slider } from "cennge-ui";

const percents = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));
const jobs = [1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }));
const hours = [0, 6, 12, 18, 24].map((value) => ({ value, label: `${String(value).padStart(2, "0")}:00` }));
const levels = ["Error", "Warning", "Info", "Debug"].map((label, value) => ({ value, label }));

export default function SliderFixture() {
  const [coverage, setCoverage] = useState(40);
  const [parallel, setParallel] = useState(4);
  const [deploy, setDeploy] = useState([9, 18]);
  const [level, setLevel] = useState(1);

  return (
    <>
      <Slider label="Coverage threshold" value={coverage} onValueChange={setCoverage} marks={percents} />
      <p>
        coverage: <span data-testid="coverage">{coverage}</span>
      </p>

      <Slider
        label="Parallel jobs"
        value={parallel}
        onValueChange={setParallel}
        min={1}
        max={16}
        marks={jobs}
        restrictToMarks
        color="secondary"
      />
      <p>
        parallel: <span data-testid="parallel">{parallel}</span>
      </p>

      <Slider label="Deploy window" value={deploy} onValueChange={setDeploy} min={0} max={24} marks={hours} color="success" />
      <p>
        window: <span data-testid="window">{deploy.join("–")}</span>
      </p>

      <Slider label="Log level" value={level} onValueChange={setLevel} min={0} max={3} marks={levels} size="lg" />
      <p>
        level: <span data-testid="level">{level}</span>
      </p>

      <Slider aria-label="Small" defaultValue={30} marks={[0, 50, 100]} size="sm" color="warning" />
      <Slider label="Retention (disabled)" defaultValue={30} max={90} marks={[0, 30, 60, 90].map((value) => ({ value, label: `${value} d` }))} isDisabled />
      <button type="button">After</button>
    </>
  );
}
