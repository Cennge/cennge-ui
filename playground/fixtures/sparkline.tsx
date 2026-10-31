import { Sparkline } from "cennge-ui/charts";

export default function SparklineFixture() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Sparkline aria-label="Downloads over 12 weeks, up by half" data={[40, 42, 39, 45, 51, 48, 55, 58, 54, 61, 66, 72]} />
      <Sparkline aria-label="Open issues over 12 weeks, down" data={[30, 28, 31, 27, 24, 25, 21, 19, 20, 16, 14, 12]} variant="area" color="success" className="h-12 w-40" />
      <Sparkline aria-label="Errors a day, with a gap" data={[3, 5, 4, null, null, 6, 2, 3]} curve="smooth" />
      <Sparkline aria-label="Stars, flat" data={[7, 7, 7, 7]} />
    </div>
  );
}
