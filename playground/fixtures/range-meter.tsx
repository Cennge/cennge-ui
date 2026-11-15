import { RangeMeter } from "cennge-ui";

export default function RangeMeterFixture() {
  return (
    <div className="flex max-w-md flex-col gap-6">
      <RangeMeter label="Test coverage" value={72} low={80} max={100} unit="%" />
      <RangeMeter label="Build time" value={48} low={30} high={60} unit="s" />
      <RangeMeter label="Button, gzip" value={2.1} high={3} unit="KB" />
      <RangeMeter label="CI minutes this month" value={2136} high={2000} unit="min" />
      <RangeMeter label="Open pull requests" value={3} max={10} color="info" showStatus={false} />
    </div>
  );
}
