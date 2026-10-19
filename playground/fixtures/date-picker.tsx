import { useState } from "react";
import { Button, DatePicker } from "cennge-ui";

const isWeekend = (iso: string) => {
  const day = new Date(`${iso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

export default function DatePickerFixture() {
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("release")));
        }}
      >
        <DatePicker label="Release" name="release" defaultValue="2026-10-19" locale="en-US" description="Planned day" />
        <Button type="submit" className="self-start">
          Save
        </Button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>

      <DatePicker label="Дата рождения" locale="ru-RU" maxValue="2026-10-19" variant="bordered" />
      <DatePicker
        label="Meeting"
        locale="en-GB"
        minValue="2026-10-05"
        maxValue="2026-11-20"
        isDateUnavailable={isWeekend}
        color="secondary"
        size="sm"
      />
      <div style={{ height: 420 }} aria-hidden="true" />
    </>
  );
}
