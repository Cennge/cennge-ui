import { useState } from "react";
import { Button, DateRangePicker } from "cennge-ui";

export default function DateRangePickerFixture() {
  const [submitted, setSubmitted] = useState("");

  return (
    <>
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSubmitted(`${String(data.get("from"))}/${String(data.get("to"))}`);
        }}
      >
        <DateRangePicker
          label="Vacation"
          startName="from"
          endName="to"
          defaultValue={{ start: "2026-10-26", end: "2026-10-30" }}
          locale="en-US"
          description="Up to two weeks"
        />
        <Button type="submit" className="self-start">
          Request
        </Button>
      </form>
      <p>
        submitted: <span data-testid="submitted">{submitted}</span>
      </p>
      <DateRangePicker label="Спринт" locale="ru-RU" variant="bordered" color="success" />
      <div style={{ height: 520 }} aria-hidden="true" />
    </>
  );
}
