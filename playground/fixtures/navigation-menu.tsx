import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "cennge-ui";

const components = [
  { title: "Carousel", description: "Slides on native scroll snapping", href: "#carousel" },
  { title: "Rating", description: "Stars to rate or to show an average", href: "#rating" },
  { title: "Form", description: "Server errors under their fields", href: "#form" },
  { title: "ScrollArea", description: "Scrollbars in the theme's colours", href: "#scroll-area" },
];

function Menu({ label, openOn, keepMounted, orientation }: { label: string; openOn?: "hover" | "click"; keepMounted?: boolean; orientation?: "horizontal" | "vertical" }) {
  return (
    <NavigationMenu aria-label={label} openOn={openOn} keepMounted={keepMounted} orientation={orientation}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[min(28rem,calc(100vw-2rem))] gap-1 sm:grid-cols-2">
              {components.map((item) => (
                <li key={item.title}>
                  <NavigationMenuLink href={item.href} title={item.title} description={item.description} />
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Repositories</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-56 gap-1">
              <li>
                <NavigationMenuLink href="#cennge-ui" title="cennge-ui" description="This library" />
              </li>
              <li>
                <NavigationMenuLink href="#ai-niche-scout" title="ai-niche-scout" />
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#changelog" isActive>
            Changelog
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default function NavigationMenuFixture() {
  return (
    <>
      <button type="button">Before</button>
      <Menu label="Main" />
      <div className="h-56" />
      <Menu label="Click menu" openOn="click" />
      <div className="h-56" />
      <div className="flex justify-end">
        <Menu label="Right edge" />
      </div>
      <div className="h-56" />
      <Menu label="Docs" orientation="vertical" />
      <div className="h-40" />
      <Menu label="Crawlable" keepMounted />
      <div className="h-56" />
      <button type="button">After</button>
    </>
  );
}
