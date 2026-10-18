import { useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
  Input,
  Tooltip,
  type CenngeColor,
} from "cennge-ui";

const colors: CenngeColor[] = ["default", "primary", "secondary", "success", "warning", "danger", "info"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  search: "M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  copy: "M8 8h12v12H8zM4 16V4h12",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14",
  download: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16",
  heart: "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z",
};

export function ComponentsDemo() {
  const [email, setEmail] = useState("");
  const emailInvalid = email.length > 0 && !email.includes("@");

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Input">
          <div className="flex flex-col gap-4">
            <Input
              label="Поиск"
              placeholder="Моды, ресурспаки, шейдеры…"
              startContent={<Icon d={icons.search} />}
              isClearable
              defaultValue="sodium"
            />
            <Input
              label="Email"
              variant="bordered"
              isRequired
              value={email}
              onValueChange={setEmail}
              placeholder="you@example.com"
              description="Пришлём ссылку для входа"
              isInvalid={emailInvalid}
              errorMessage="В адресе нет символа @"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Faded" variant="faded" placeholder="faded" />
              <Input label="Underlined" variant="underlined" placeholder="underlined" />
            </div>
            <Input label="Недоступно" isDisabled defaultValue="read only" />
          </div>
        </Section>

        <Section title="Badge">
          <div className="flex flex-col gap-3">
            {(["solid", "flat", "bordered", "faded", "dot"] as const).map((v) => (
              <div key={v} className="flex flex-wrap items-center gap-2">
                {colors.map((c) => (
                  <Badge key={c} color={c} variant={v}>
                    {c}
                  </Badge>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm" color="primary">
                sm
              </Badge>
              <Badge size="md" color="primary">
                md
              </Badge>
              <Badge size="lg" color="primary">
                lg
              </Badge>
              <Badge color="success" variant="flat" radius="sm" startContent={<Icon d={icons.download} />}>
                12.4M загрузок
              </Badge>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Card">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex size-12 items-center justify-center rounded-medium bg-primary-bg text-xl font-black text-primary-text">
                S
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-bold">Sodium</h3>
                <p className="truncate text-xs text-muted">by CaffeineMC</p>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted">Современный движок рендеринга, который заметно поднимает FPS.</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge size="sm">Optimization</Badge>
                <Badge size="sm" color="success" variant="dot">
                  Fabric
                </Badge>
              </div>
            </CardBody>
            <CardFooter>
              <Button color="primary" size="sm" startContent={<Icon d={icons.download} />}>
                Скачать
              </Button>
              <Tooltip content="В избранное">
                <Button size="sm" variant="flat" isIconOnly aria-label="В избранное">
                  <Icon d={icons.heart} />
                </Button>
              </Tooltip>
            </CardFooter>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <h3 className="font-bold">Bordered</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted">Граница вместо тени — для плотных сеток и списков.</p>
            </CardBody>
          </Card>

          <Card asChild isPressable>
            <a href="#top">
              <CardHeader>
                <h3 className="font-bold">Pressable</h3>
                <Badge size="sm" color="primary" className="ml-auto">
                  ссылка
                </Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-muted">Вся карточка — ссылка: hover, нажатие, фокус с клавиатуры.</p>
              </CardBody>
            </a>
          </Card>
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-3">
        <Section title="Dialog">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger>
                <Button color="danger" variant="flat">
                  Удалить проект
                </Button>
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>Удалить проект?</DialogTitle>
                  <DialogDescription>Все версии и файлы будут удалены. Это нельзя отменить.</DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                  <DialogClose>
                    <Button variant="flat">Отмена</Button>
                  </DialogClose>
                  <DialogClose>
                    <Button color="danger">Удалить</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger>
                <Button variant="bordered">Длинный текст</Button>
              </DialogTrigger>
              <DialogContent size="lg">
                <DialogHeader>
                  <DialogTitle>Условия использования</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  {Array.from({ length: 30 }, (_, i) => (
                    <p key={i} className="mb-3 text-muted">
                      Пункт {i + 1}. Контент длиннее экрана прокручивается внутри тела диалога, шапка и кнопки
                      остаются на месте.
                    </p>
                  ))}
                </DialogBody>
                <DialogFooter className="pt-2">
                  <DialogClose>
                    <Button color="primary">Принимаю</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Section>

        <Section title="Dropdown">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="faded" endContent={<Icon d="M6 9l6 6 6-6" />}>
                Действия
              </Button>
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>Проект</DropdownLabel>
              <DropdownItem startContent={<Icon d={icons.edit} />} shortcut="⌘E">
                Редактировать
              </DropdownItem>
              <DropdownItem startContent={<Icon d={icons.copy} />} description="Ссылка попадёт в буфер обмена">
                Копировать ссылку
              </DropdownItem>
              <DropdownItem isDisabled startContent={<Icon d={icons.download} />}>
                Экспорт (скоро)
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem color="danger" startContent={<Icon d={icons.trash} />} shortcut="⌘⌫">
                Удалить
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </Section>

        <Section title="Tooltip">
          <div className="flex flex-wrap gap-3">
            <Tooltip content="Обычная подсказка">
              <Button variant="flat">default</Button>
            </Tooltip>
            <Tooltip content="Со стрелкой" color="primary" showArrow placement="bottom">
              <Button variant="flat" color="primary">
                primary
              </Button>
            </Tooltip>
            <Tooltip content="Справа" color="danger" placement="right" showArrow>
              <Button variant="flat" color="danger">
                danger
              </Button>
            </Tooltip>
          </div>
        </Section>
      </div>
    </>
  );
}
