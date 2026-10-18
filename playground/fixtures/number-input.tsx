import { useState } from "react";
import { NumberInput } from "cennge-ui";

export default function NumberInputFixture() {
  const [stars, setStars] = useState<number | null>(5);
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <NumberInput label="Stars" value={stars} onValueChange={setStars} min={0} max={100} />
      <p>
        stars: <span data-testid="stars-value">{stars === null ? "null" : String(stars)}</span>
      </p>

      <NumberInput label="Ratio" defaultValue={0.2} step={0.1} min={0} max={1} />

      <NumberInput
        label="Цена"
        locale="ru-RU"
        defaultValue={1500}
        formatOptions={{ style: "currency", currency: "RUB" }}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))));
        }}
        className="flex flex-col gap-3"
      >
        <NumberInput label="Budget" name="budget" defaultValue={12000} max={20000} />
        <button type="submit" className="self-start rounded-small bg-surface-4 px-3 py-1.5 text-sm">
          Submit
        </button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <NumberInput label="Disabled" isDisabled defaultValue={3} />
    </>
  );
}
