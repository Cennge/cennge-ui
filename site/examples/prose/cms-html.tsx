"use client";

import { Prose } from "cennge-ui";

// HTML as a CMS or a Markdown renderer returns it. Only render HTML you trust or have sanitised.
const releaseNotes = `
<h2>0.3.0</h2>
<p>Charts, in a new entry <code>cennge-ui/charts</code>, drawn in SVG with no chart library underneath.</p>
<table>
  <thead>
    <tr><th>Import from</th><th>What it adds</th></tr>
  </thead>
  <tbody>
    <tr><td><code>cennge-ui</code></td><td>The components</td></tr>
    <tr><td><code>cennge-ui/charts</code></td><td>BarChart, LineChart, AreaChart, DonutChart, Sparkline</td></tr>
    <tr><td><code>cennge-ui/map</code></td><td>Maps on MapLibre GL</td></tr>
  </tbody>
</table>
<blockquote><p>Series take an eight-colour palette checked for colour blindness in both themes.</p></blockquote>
`;

export default function ReleaseNotes() {
  return <Prose className="w-full" dangerouslySetInnerHTML={{ __html: releaseNotes }} />;
}
