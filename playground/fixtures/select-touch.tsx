import { useState } from "react";
import { Button, Select, SelectItem } from "cennge-ui";

const regions = ["eu-central-1", "eu-west-1", "us-east-1", "us-west-2", "ap-southeast-1"];

/** A Select whose open list covers a button: a tap on an option must not reach the button (Radix #1658). */
export default function SelectTouchFixture() {
  const [region, setRegion] = useState<string | null>(null);
  const [deletes, setDeletes] = useState(0);

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Select label="Region" placeholder="Pick a region" value={region} onValueChange={setRegion}>
        {regions.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </Select>
      <Button color="danger" fullWidth onClick={() => setDeletes((n) => n + 1)}>
        Delete deployment
      </Button>
      <Button variant="flat" fullWidth onClick={() => setDeletes((n) => n + 1)}>
        Delete logs
      </Button>
      <p data-testid="result" className="text-sm text-muted">
        region {region ?? "none"}, deletes {deletes}
      </p>
    </div>
  );
}
