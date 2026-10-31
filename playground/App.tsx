import { useEffect, useState, type ReactNode } from "react";
import {
  Button,
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Kbd,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ThemeSwitch,
  toast,
  useTheme,
  type CenngeColor,
  type CenngeRadius,
  type CenngeSize,
  type CenngeVariant,
} from "cennge-ui";
import { ComponentsDemo } from "./ComponentsDemo";
import { MoreDemo } from "./MoreDemo";
import { SelectDemo } from "./SelectDemo";
import { LayoutDemo } from "./LayoutDemo";
import { BasicsDemo } from "./BasicsDemo";
import { AdvancedDemo } from "./AdvancedDemo";
import { RepositoryDemo } from "./RepositoryDemo";
import { AccountDemo } from "./AccountDemo";
import { DatesDemo } from "./DatesDemo";
import { DataDemo } from "./DataDemo";
import { ShellDemo } from "./ShellDemo";
import { MapDemo } from "./MapDemo";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];
const variants: CenngeVariant[] = ["solid", "shadow", "bordered", "flat", "faded", "light", "ghost"];
const sizes: CenngeSize[] = ["sm", "md", "lg"];
const radii: CenngeRadius[] = ["none", "sm", "md", "lg", "full"];
const accents = ["orange", "blue", "green", "violet", "red"] as const;
/** The playground opens dark, like the library's design: kept by initTheme in main.tsx and ThemeScript in Next. */
export const themeOptions = { defaultTheme: "dark" } as const;

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

const sections = [
  "Snippet",
  "AlertDialog",
  "PasswordInput",
  "OtpInput",
  "DatePicker",
  "DateRangePicker",
  "TimeInput",
  "Calendar",
  "Table",
  "Tree",
  "Sidebar",
  "TagsInput",
  "FileUpload",
  "NumberInput",
  "Stepper",
  "Map",
];

function scrollToSection(title: string) {
  const heading = Array.from(document.querySelectorAll("section h2")).find((node) => node.textContent === title);
  heading?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const navigation = [
  {
    title: "Формы",
    links: [
      ["Form + server action", "Ошибки сервера под полями"],
      ["DatePicker", "Дата с клавиатуры и из календаря"],
      ["TagsInput", "Теги, вставка списком"],
      ["Slider", "Метки и остановка на них"],
    ],
  },
  {
    title: "Данные",
    links: [
      ["Table", "Сортировка и выбор строк"],
      ["Tree", "Файлы с подгрузкой папок"],
      ["ScrollArea", "Полосы прокрутки в цветах темы"],
      ["Carousel", "Нативная прокрутка со снапом"],
    ],
  },
  {
    title: "Оверлеи",
    links: [
      ["AlertDialog", "Подтверждение с ожиданием"],
      ["Snippet", "Команды с копированием"],
      ["Rating", "Звёзды и средняя оценка"],
      ["Prose", "README в цветах темы"],
    ],
  },
] as const;

/** Разделы песочницы: панель открывается под своим пунктом и не выходит за край окна. */
function SectionsMenu() {
  return (
    <NavigationMenu aria-label="Разделы">
      <NavigationMenuList>
        {navigation.map((group) => (
          <NavigationMenuItem key={group.title}>
            <NavigationMenuTrigger>{group.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid grid-cols-1 w-[min(30rem,calc(100vw-2rem))] gap-1 sm:grid-cols-2">
                {group.links.map(([title, description]) => (
                  <li key={title}>
                    <NavigationMenuLink
                      href={`#${title}`}
                      title={title}
                      description={description}
                      onClick={(event) => {
                        event.preventDefault();
                        scrollToSection(title);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem>
          <NavigationMenuLink href="https://github.com/Cennge/cennge-ui">GitHub</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function Palette(props: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onToggleTheme: () => void;
  onAccent: (accent: (typeof accents)[number]) => void;
  isDark: boolean;
}) {
  return (
    <CommandDialog
      label="Команды"
      placeholder="Команда или раздел…"
      emptyContent="Ничего не найдено"
      labels={{ results: (count) => `Найдено: ${count}` }}
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
    >
      <CommandGroup heading="Тема">
        <CommandItem onAction={props.onToggleTheme} keywords={["theme", "dark", "light"]}>
          {props.isDark ? "Светлая тема" : "Тёмная тема"}
        </CommandItem>
        {accents.map((accent) => (
          <CommandItem key={accent} onAction={() => props.onAccent(accent)} keywords={["accent", "цвет"]}>
            {`Акцент: ${accent}`}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Разделы">
        {sections.map((title) => (
          <CommandItem key={title} onAction={() => scrollToSection(title)} keywords={["перейти"]}>
            {title}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Действия">
        <CommandItem
          onAction={() => {
            void navigator.clipboard?.writeText("pnpm add cennge-ui");
            toast.success("Команда установки скопирована");
          }}
          keywords={["install", "npm", "pnpm"]}
          description="pnpm add cennge-ui"
        >
          Скопировать команду установки
        </CommandItem>
      </CommandGroup>
    </CommandDialog>
  );
}

export function App() {
  const { resolvedTheme, setTheme } = useTheme(themeOptions);
  const [accent, setAccent] = useState<(typeof accents)[number]>("orange");
  const [isPaletteOpen, setPaletteOpen] = useState(false);
  const toggleTheme = () => setTheme(resolvedTheme === "light" ? "dark" : "light");

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">cennge-ui</h1>
          <p className="text-muted">Песочница компонентов</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {accents.map((a) => (
            <Button
              key={a}
              size="sm"
              variant={accent === a ? "solid" : "faded"}
              color={accent === a ? "primary" : "default"}
              onClick={() => setAccent(a)}
            >
              {a}
            </Button>
          ))}
          <ThemeSwitch {...themeOptions} labels={{ group: "Тема", light: "Светлая", dark: "Тёмная", system: "Как в системе" }} />
          <Button size="sm" variant="faded" onClick={() => setPaletteOpen(true)} endContent={<Kbd keys="command" size="sm">K</Kbd>}>
            Команды
          </Button>
        </div>
      </header>
      <SectionsMenu />
      <Palette
        isOpen={isPaletteOpen}
        onOpenChange={setPaletteOpen}
        onToggleTheme={toggleTheme}
        onAccent={setAccent}
        isDark={resolvedTheme !== "light"}
      />

      <SelectDemo />
      <ComponentsDemo />
      <MoreDemo />
      <LayoutDemo />
      <BasicsDemo />
      <AdvancedDemo />
      <RepositoryDemo />
      <AccountDemo />
      <DatesDemo />
      <DataDemo />
      <MapDemo />
      <ShellDemo />

      <Section title="Button: цвета × варианты">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-2">
            <thead>
              <tr>
                <th />
                {colors.map((c) => (
                  <th key={c} className="text-left text-xs font-medium text-muted">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v}>
                  <td className="pr-2 text-xs font-medium text-muted">{v}</td>
                  {colors.map((c) => (
                    <td key={c}>
                      <Button color={c} variant={v}>
                        Button
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Размеры">
          <div className="flex flex-wrap items-center gap-3">
            {sizes.map((s) => (
              <Button key={s} size={s} color="primary">
                Size {s}
              </Button>
            ))}
            {sizes.map((s) => (
              <Button key={`icon-${s}`} size={s} color="primary" variant="flat" isIconOnly aria-label="Добавить">
                <PlusIcon />
              </Button>
            ))}
          </div>
        </Section>

        <Section title="Скругления">
          <div className="flex flex-wrap items-center gap-3">
            {radii.map((r) => (
              <Button key={r} radius={r} color="secondary">
                {r}
              </Button>
            ))}
          </div>
        </Section>

        <Section title="Состояния">
          <div className="flex flex-wrap items-center gap-3">
            <Button color="primary" isLoading>
              Сохраняю
            </Button>
            <Button color="primary" isDisabled>
              Недоступно
            </Button>
            <Button color="primary" variant="bordered" startContent={<PlusIcon />}>
              С иконкой
            </Button>
            <Button color="danger" variant="flat" isIconOnly isLoading aria-label="Удаление" />
          </div>
        </Section>

        <Section title="asChild + fullWidth">
          <div className="flex flex-col gap-3">
            <Button asChild color="info" variant="flat">
              <a href="#top">Ссылка в стиле кнопки</a>
            </Button>
            <Button color="primary" variant="shadow" fullWidth size="lg">
              Скачать
            </Button>
          </div>
        </Section>
      </div>
    </main>
  );
}
