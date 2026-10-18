import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Skeleton,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function MoreDemo() {
  const [loaded, setLoaded] = useState(false);
  const [alertOpen, setAlertOpen] = useState(true);
  const [notify, setNotify] = useState(true);
  const [labels, setLabels] = useState({ bug: true, feature: false, docs: false });
  const checkedCount = Object.values(labels).filter(Boolean).length;

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Toast">
          <div className="flex flex-wrap gap-2">
            <Button variant="flat" onClick={() => toast("Ссылка скопирована")}>
              Обычный
            </Button>
            <Button
              variant="flat"
              color="success"
              onClick={() => toast.success("Деплой завершён", { description: "cennge-ui v0.1.0 опубликован" })}
            >
              Success
            </Button>
            <Button
              variant="flat"
              color="danger"
              onClick={() => toast.error("CI упал", { description: "typecheck: 2 ошибки в dialog.tsx" })}
            >
              Error
            </Button>
            <Button
              variant="flat"
              color="warning"
              onClick={() =>
                toast.warning("Ветка устарела", {
                  description: "main ушёл на 3 коммита вперёд",
                  action: { label: "Обновить", onClick: () => toast.success("Ветка обновлена") },
                })
              }
            >
              С действием
            </Button>
            <Button
              variant="flat"
              color="primary"
              onClick={() =>
                toast.promise(wait(1600), {
                  loading: "Пушу в origin/main…",
                  success: "Запушено",
                  error: "Не удалось запушить",
                })
              }
            >
              Promise
            </Button>
          </div>
        </Section>

        <Section title="Alert">
          <div className="flex flex-col gap-3">
            <Alert color="info" title="Доступна новая версия" description="tailwind-variants 3.4 — посмотрите changelog." />
            <Alert color="success" variant="bordered" title="Все проверки пройдены" />
            {alertOpen ? (
              <Alert
                color="danger"
                variant="faded"
                title="Сборка упала"
                description="Job “Typecheck, test, build” завершился с ошибкой."
                isClosable
                onClose={() => setAlertOpen(false)}
              />
            ) : (
              <Button size="sm" variant="light" onClick={() => setAlertOpen(true)}>
                Вернуть алерт
              </Button>
            )}
            <Alert
              color="warning"
              variant="solid"
              title="Токен истекает через 3 дня"
              endContent={
                <Button size="sm" variant="flat" className="bg-black/15 text-current">
                  Продлить
                </Button>
              }
            />
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Section title="Switch">
          <div className="flex flex-col gap-4">
            <Switch isSelected={notify} onValueChange={setNotify}>
              Уведомления о pull requests {notify ? "включены" : "выключены"}
            </Switch>
            <Switch defaultSelected color="success" size="sm">
              Автомерж (sm)
            </Switch>
            <Switch color="secondary" size="lg">
              Приватный репозиторий (lg)
            </Switch>
            <Switch isDisabled defaultSelected>
              Недоступно
            </Switch>
          </div>
        </Section>

        <Section title="Checkbox">
          <div className="flex flex-col gap-3">
            <Checkbox
              isSelected={checkedCount === 3}
              isIndeterminate={checkedCount > 0 && checkedCount < 3}
              onValueChange={(v) => setLabels({ bug: v, feature: v, docs: v })}
            >
              Все метки
            </Checkbox>
            <div className="flex flex-col gap-2 pl-7">
              <Checkbox color="danger" isSelected={labels.bug} onValueChange={(v) => setLabels({ ...labels, bug: v })}>
                bug
              </Checkbox>
              <Checkbox
                color="success"
                isSelected={labels.feature}
                onValueChange={(v) => setLabels({ ...labels, feature: v })}
              >
                feature
              </Checkbox>
              <Checkbox color="info" isSelected={labels.docs} onValueChange={(v) => setLabels({ ...labels, docs: v })}>
                docs
              </Checkbox>
            </div>
            <Checkbox isDisabled defaultSelected>
              Недоступно
            </Checkbox>
          </div>
        </Section>

        <Section title="Avatar">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar src="/avatar.svg" name="Cennge" size="xl" />
              <Avatar name="Illia Gliba" color="primary" size="lg" />
              <Avatar name="ai-niche-scout" color="info" radius="md" />
              <Avatar name="payload-cache" color="success" size="sm" />
            </div>
            <AvatarGroup max={4}>
              {["Cennge", "Ann Lee", "Bob Stone", "Kate Moss", "Max Payne", "Zoe Ray"].map((n, i) => (
                <Avatar
                  key={n}
                  name={n}
                  isBordered
                  src={i === 0 ? "/avatar.svg" : undefined}
                  color={(["primary", "secondary", "success", "warning", "info", "danger"] as const)[i]}
                />
              ))}
            </AvatarGroup>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Tabs">
          <div className="flex flex-col gap-6">
            <Tabs defaultValue="code">
              <TabsList aria-label="Репозиторий">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="issues">
                  Issues
                  <Badge size="sm">12</Badge>
                </TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="wiki" isDisabled>
                  Wiki
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="text-sm text-muted">
                src/, playground/, README.md — 47 файлов
              </TabsContent>
              <TabsContent value="issues" className="text-sm text-muted">
                12 открытых issues
              </TabsContent>
              <TabsContent value="actions" className="text-sm text-muted">
                CI: 3 успешных запуска
              </TabsContent>
            </Tabs>
            <Tabs defaultValue="readme" variant="underlined" color="primary">
              <TabsList aria-label="Файлы">
                <TabsTrigger value="readme">README</TabsTrigger>
                <TabsTrigger value="license">License</TabsTrigger>
                <TabsTrigger value="contributing">Contributing</TabsTrigger>
              </TabsList>
              <TabsContent value="readme" className="text-sm text-muted">
                Tactile, dark-first React components on Radix UI and Tailwind CSS v4.
              </TabsContent>
              <TabsContent value="license" className="text-sm text-muted">
                MIT © Cennge
              </TabsContent>
              <TabsContent value="contributing" className="text-sm text-muted">
                pnpm install → pnpm dev → pnpm test
              </TabsContent>
            </Tabs>
            <Tabs defaultValue="day" variant="light" color="secondary" size="sm">
              <TabsList aria-label="Период">
                <TabsTrigger value="day">День</TabsTrigger>
                <TabsTrigger value="week">Неделя</TabsTrigger>
                <TabsTrigger value="month">Месяц</TabsTrigger>
              </TabsList>
              <TabsContent value="day" className="text-sm text-muted">
                4 коммита за сегодня
              </TabsContent>
              <TabsContent value="week" className="text-sm text-muted">
                23 коммита за неделю
              </TabsContent>
              <TabsContent value="month" className="text-sm text-muted">
                81 коммит за месяц
              </TabsContent>
            </Tabs>
          </div>
        </Section>

        <Section title="Skeleton + Spinner">
          <div className="flex flex-col gap-4">
            <Card>
              <CardBody className="flex-row items-center gap-3">
                <Skeleton isLoaded={loaded} className="size-12 rounded-full">
                  <Avatar src="/avatar.svg" name="Cennge" size="lg" />
                </Skeleton>
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton isLoaded={loaded} className="h-4 w-32">
                    <p className="font-bold">Cennge</p>
                  </Skeleton>
                  <Skeleton isLoaded={loaded} className="h-3 w-48">
                    <p className="text-sm text-muted">20 репозиториев · TypeScript</p>
                  </Skeleton>
                </div>
              </CardBody>
            </Card>
            <Button size="sm" variant="flat" onClick={() => setLoaded((v) => !v)} className="self-start">
              {loaded ? "Показать скелетон" : "Показать контент"}
            </Button>
            <div className="flex items-center gap-4">
              <Spinner size="sm" color="default" />
              <Spinner color="primary" label="Загрузка" />
              <Spinner size="lg" color="success" />
              <Spinner size="lg" color="danger" />
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
