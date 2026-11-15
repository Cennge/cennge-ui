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

const families = [
  {
    title: "Inputs",
    pages: [
      { slug: "combobox", title: "Combobox", description: "Type to filter, pick one or many" },
      { slug: "tags-input", title: "TagsInput", description: "Free text turned into tags with Enter" },
      { slug: "file-upload", title: "FileUpload", description: "Drop zone and file list with limits" },
    ],
  },
  {
    title: "Overlays",
    pages: [
      { slug: "dialog", title: "Dialog", description: "A modal with header, scrolling body and footer" },
      { slug: "drawer", title: "Drawer", description: "A panel from any edge of the screen" },
      { slug: "command", title: "Command", description: "A palette across actions and pages" },
    ],
  },
  {
    title: "Charts",
    pages: [
      { slug: "bar-chart", title: "BarChart", description: "Grouped or stacked bars" },
      { slug: "line-chart", title: "LineChart", description: "Series over time, with a crosshair tooltip" },
      { slug: "sparkline", title: "Sparkline", description: "A trend in a line of text or a stat card" },
    ],
  },
];

export default function DocsMenu() {
  return (
    <NavigationMenu aria-label="Components" orientation="vertical" className="w-44">
      <NavigationMenuList>
        {families.map((family) => (
          <NavigationMenuItem key={family.title}>
            <NavigationMenuTrigger className="w-full justify-between">{family.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-72 gap-1">
                {family.pages.map((page) => (
                  <li key={page.slug}>
                    <NavigationMenuLink asChild title={page.title} description={page.description}>
                      <Link href={`/docs/${page.slug}/`} />
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
