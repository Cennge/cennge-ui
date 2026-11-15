"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "cennge-ui";

const charts = [
  { slug: "bar-chart", title: "BarChart", description: "Grouped or stacked bars, vertical or horizontal" },
  { slug: "line-chart", title: "LineChart", description: "Series over time, with a crosshair tooltip" },
  { slug: "area-chart", title: "AreaChart", description: "Lines with a wash below, stacked or not" },
  { slug: "donut-chart", title: "DonutChart", description: "Parts of a whole as a ring or a pie" },
];

export default function CrawlableMenu() {
  return (
    <NavigationMenu aria-label="Charts" keepMounted>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Charts</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(28rem,calc(100vw-4rem))] gap-1 sm:grid-cols-2">
              {charts.map((chart) => (
                <li key={chart.slug}>
                  <NavigationMenuLink asChild title={chart.title} description={chart.description}>
                    <Link href={`/docs/${chart.slug}/`} />
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/docs/charts/">Overview</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
