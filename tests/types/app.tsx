// An app on React 17 or 18. CI compiles it against that React's types with skipLibCheck off, so the
// published declarations (dist/*.d.ts, through the package's own "exports") must hold up under each.
import * as React from "react";
import {
  Button,
  DatePicker,
  Dialog,
  DialogContent,
  DialogTrigger,
  Form,
  Input,
  Toaster,
  VirtualList,
  toast,
} from "cennge-ui";
import { cn } from "cennge-ui/utils";
import { Map, MapArc, MapClusterLayer, MapControls, MapGeoJSON, MapLegend, MapMarker, MapRoute } from "cennge-ui/map";

const repositories = ["ai-niche-scout", "cennge-ui", "payload-cache", "spredo-crypto-screener"];

export function App() {
  const [release, setRelease] = React.useState<string | null>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className={cn("grid gap-4", release && "pt-2")}>
      <Form onSubmit={(event) => event.preventDefault()}>
        <Input ref={nameRef} name="repository" label="Repository" isRequired />
        <DatePicker label="Release date" value={release} onValueChange={setRelease} />
        <Button type="submit" color="primary" onClick={() => toast.success("Saved")}>
          Save
        </Button>
      </Form>
      <Dialog>
        <DialogTrigger>
          <Button variant="flat">Details</Button>
        </DialogTrigger>
        <DialogContent>cennge-ui</DialogContent>
      </Dialog>
      <VirtualList items={repositories} getKey={(name) => name} aria-label="Repositories" className="h-40">
        {(name, index) => <span>{`${index + 1}. ${name}`}</span>}
      </VirtualList>
      <Map aria-label="Offices" defaultCenter={[-73.9855, 40.758]} defaultZoom={11} onViewChange={(view) => view.zoom}>
        <MapControls showLocate />
        <MapMarker lngLat={[-73.9855, 40.758]} label="Manhattan office" popup={<p>cennge-ui</p>} />
        <MapRoute coordinates={[[-73.9855, 40.758], [-73.8331, 40.7675]]} color="secondary" />
        <MapArc arcs={[{ from: [-73.9855, 40.758], to: [-73.9888, 40.7033] }]} curvature={0.3} />
        <MapGeoJSON data="https://example.com/regions.geojson" valueProperty="stars" domain={[0, 100]} tooltip={(region) => String(region.name)} />
        <MapLegend title="Stars" domain={[0, 100]} />
        <MapClusterLayer items={repositories} getLngLat={() => [-73.9855, 40.758]} getLabel={(name) => name} />
      </Map>
      <Toaster placement="top-right" />
    </div>
  );
}
