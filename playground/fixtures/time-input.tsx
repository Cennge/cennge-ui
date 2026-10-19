import { useState } from "react";
import { Button, TimeInput } from "cennge-ui";

export default function TimeInputFixture() {
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("start")));
        }}
      >
        <TimeInput label="Start" name="start" defaultValue="09:00" locale="en-US" description="Your local time" />
        <Button type="submit" className="self-start">
          Save
        </Button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>
      <TimeInput
        label="Начало созвона"
        locale="ru-RU"
        step={15}
        minValue="09:00"
        maxValue="18:00"
        defaultValue="10:00"
        variant="bordered"
        description="С 09:00 до 18:00, шаг 15 минут"
      />
      {/* Somewhere for Tab to go: headless Firefox has no browser UI after the last field. */}
      <Button className="self-start">Done</Button>
    </>
  );
}
