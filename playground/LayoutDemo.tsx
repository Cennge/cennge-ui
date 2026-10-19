import { useEffect, useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Pagination,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Textarea,
  toast,
} from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

export function LayoutDemo() {
  const [visibility, setVisibility] = useState("public");
  const [stars, setStars] = useState<number[]>([10, 500]);
  const [page, setPage] = useState(7);
  const [upload, setUpload] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setUpload((v) => (v >= 100 ? 0 : v + 8)), 700);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <Section title="RadioGroup">
          <RadioGroup label="Видимость репозитория" value={visibility} onValueChange={setVisibility} isRequired>
            <Radio value="public" description="Видят все в интернете">
              Public
            </Radio>
            <Radio value="private" description="Только вы и приглашённые">
              Private
            </Radio>
            <Radio value="internal" isDisabled description="Только для организаций">
              Internal
            </Radio>
          </RadioGroup>
        </Section>

        <Section title="Textarea">
          <Textarea
            label="Описание релиза"
            placeholder="Что изменилось в этой версии…"
            defaultValue={"### Added\n- Select, Combobox, MultiSelect"}
            description="Растёт по мере ввода, от 3 до 8 строк"
            minRows={3}
            maxRows={8}
          />
        </Section>

        <Section title="Slider">
          <div className="flex flex-col gap-6">
            <Slider label="Звёзды" value={stars} onValueChange={setStars} min={0} max={1000} step={10} />
            <Slider
              label="Порог покрытия"
              defaultValue={80}
              formatValue={(v) => `${v}%`}
              marks={[0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }))}
              color="secondary"
            />
            <Slider
              label="Параллельные задачи CI"
              defaultValue={4}
              min={1}
              max={16}
              marks={[1, 2, 4, 8, 16].map((value) => ({ value, label: String(value) }))}
              restrictToMarks
              color="success"
            />
            <Slider aria-label="Громкость" defaultValue={30} color="warning" size="sm" />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Accordion">
          <div className="flex flex-col gap-6">
            <Accordion defaultValue="install">
              <AccordionItem value="install" title="Как установить?" subtitle="Одна команда">
                <code className="rounded-small bg-surface-4 px-1.5 py-0.5 text-foreground">pnpm add cennge-ui</code> и
                одна строка в CSS: <code className="text-foreground">@import "cennge-ui/styles.css"</code>.
              </AccordionItem>
              <AccordionItem value="theme" title="Можно поменять цвета?">
                Да: атрибут data-accent на html или свои --cennge-* переменные.
              </AccordionItem>
              <AccordionItem value="ssr" title="Работает с Next.js App Router?">
                Да, "use client" уже в сборке, а cn и tv импортируются из cennge-ui/utils на сервере.
              </AccordionItem>
            </Accordion>
            <Accordion variant="splitted" selectionMode="multiple" defaultValue={["ci"]}>
              <AccordionItem value="ci" title="CI" subtitle="Typecheck, test, build">
                Каждый push проверяется GitHub Actions.
              </AccordionItem>
              <AccordionItem value="release" title="Релизы" subtitle="changesets">
                Версии и CHANGELOG собираются из changeset-файлов.
              </AccordionItem>
            </Accordion>
          </div>
        </Section>

        <div className="flex flex-col gap-6">
          <Section title="Progress">
            <div className="flex flex-col gap-4">
              <Progress label="Загрузка релиза" value={upload} />
              <Progress label="Свободное место" value={734} max={1024} color="success" formatValue={(v, m) => `${v} / ${m} МБ`} />
              <Progress aria-label="Клонирование" color="secondary" size="sm" />
            </div>
          </Section>

          <Section title="Pagination">
            <div className="flex flex-col gap-3">
              <Pagination total={24} page={page} onPageChange={setPage} />
              <Pagination total={5} defaultPage={2} color="secondary" radius="full" size="sm" />
              <p className="text-sm text-muted">Страница {page} из 24 · коммиты main</p>
            </div>
          </Section>
        </div>
      </div>

      <Section title="Drawer + Popover">
        <div className="flex flex-wrap gap-3">
          <Drawer>
            <DrawerTrigger>
              <Button variant="faded">Настройки (справа)</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Настройки репозитория</DrawerTitle>
                <DrawerDescription>cennge-ui · public</DrawerDescription>
              </DrawerHeader>
              <DrawerBody className="flex flex-col gap-5">
                <Input label="Название" defaultValue="cennge-ui" />
                <Textarea label="Описание" defaultValue="Tactile, dark-first React components" minRows={2} />
                <Switch defaultSelected>Issues</Switch>
                <Switch>Discussions</Switch>
              </DrawerBody>
              <DrawerFooter>
                <DrawerClose>
                  <Button variant="flat">Отмена</Button>
                </DrawerClose>
                <DrawerClose>
                  <Button color="primary" onClick={() => toast.success("Настройки сохранены")}>
                    Сохранить
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          <Drawer>
            <DrawerTrigger>
              <Button variant="faded">Снизу (мобильный)</Button>
            </DrawerTrigger>
            <DrawerContent placement="bottom">
              <DrawerHeader>
                <DrawerTitle>Клонировать</DrawerTitle>
              </DrawerHeader>
              <DrawerBody>
                <code className="block rounded-medium bg-surface-4 p-3 text-xs text-foreground">
                  git clone https://github.com/Cennge/cennge-ui.git
                </code>
              </DrawerBody>
            </DrawerContent>
          </Drawer>

          <Popover>
            <PopoverTrigger>
              <Button variant="faded">Поделиться</Button>
            </PopoverTrigger>
            <PopoverContent showArrow className="w-72">
              <div className="flex flex-col gap-3">
                <p className="font-semibold">Ссылка на репозиторий</p>
                <Input size="sm" readOnly defaultValue="github.com/Cennge/cennge-ui" />
                <PopoverClose>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => {
                      void navigator.clipboard?.writeText("https://github.com/Cennge/cennge-ui");
                      toast("Ссылка скопирована");
                    }}
                  >
                    Копировать
                  </Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Section>
    </>
  );
}
