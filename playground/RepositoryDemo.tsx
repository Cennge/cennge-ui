import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Carousel,
  CarouselContent,
  CarouselControls,
  CarouselItem,
  Input,
  Prose,
  Rating,
  Snippet,
  Switch,
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

const repository = "Cennge/ai-niche-scout";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function DangerZone() {
  const [confirmation, setConfirmation] = useState("");
  const [isOffline, setOffline] = useState(false);

  const deleteRepository = async () => {
    await wait(1500);
    if (isOffline) {
      toast.error("Не удалось удалить репозиторий", { description: "Нет соединения. Попробуйте ещё раз." });
      throw new Error("offline"); // диалог остаётся открытым
    }
    toast.success("Репозиторий удалён", { description: repository });
  };

  return (
    <div className="flex flex-col divide-y divide-border rounded-large border border-danger/40">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Архивировать репозиторий</p>
          <p className="text-sm text-muted">Только чтение: без новых issues и коммитов.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="flat" color="warning" className="shrink-0">
              Архивировать
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Архивировать {repository}?</AlertDialogTitle>
              <AlertDialogDescription>Разархивировать можно в любой момент в настройках.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction color="warning" onAction={() => toast("Репозиторий в архиве")}>
                Архивировать
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Удалить репозиторий</p>
          <p className="text-sm text-muted">Удаление нельзя отменить.</p>
        </div>
        <AlertDialog onOpenChange={(isOpen) => !isOpen && setConfirmation("")}>
          <AlertDialogTrigger>
            <Button variant="flat" color="danger" className="shrink-0">
              Удалить
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить {repository}?</AlertDialogTitle>
              <AlertDialogDescription>Issues, релизы и wiki будут удалены навсегда.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Input
                label={`Введите ${repository} для подтверждения`}
                value={confirmation}
                onValueChange={setConfirmation}
                autoComplete="off"
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                color="danger"
                isDisabled={confirmation !== repository}
                onAction={deleteRepository}
              >
                Удалить навсегда
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="p-4">
        <Switch isSelected={isOffline} onValueChange={setOffline} size="sm">
          Симулировать обрыв сети при удалении
        </Switch>
      </div>
    </div>
  );
}

function Commands() {
  const labels = { copyLabel: "Скопировать", copiedLabel: "Скопировано" };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Установка</p>
        <Snippet {...labels}>pnpm add cennge-ui</Snippet>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium">Запуск {repository} локально</p>
        <Snippet {...labels} variant="bordered">
          {`git clone https://github.com/${repository}.git
cd ai-niche-scout
pnpm install && pnpm dev`}
        </Snippet>
      </div>
      <div className="flex flex-wrap gap-2">
        <Snippet {...labels} variant="solid" color="primary" size="sm">
          pnpm dev
        </Snippet>
        <Snippet {...labels} color="success" size="sm">
          pnpm test
        </Snippet>
        <Snippet {...labels} variant="faded" size="sm" symbol=">">
          pnpm changeset
        </Snippet>
      </div>
    </div>
  );
}

/** "1 звезда", "3 звезды", "5 звёзд", "3,5 звезды". */
function ratingLabel(value: number) {
  if (value === 0) return "Без оценки";
  if (!Number.isInteger(value)) return `${String(value).replace(".", ",")} звезды`;
  const [ones, tens] = [value % 10, value % 100];
  const word = ones === 1 && tens !== 11 ? "звезда" : ones >= 2 && ones <= 4 && (tens < 12 || tens > 14) ? "звезды" : "звёзд";
  return `${value} ${word}`;
}

const repositories = [
  { name: "Cennge/ai-niche-scout", average: 4.3, reviews: "128 отзывов" },
  { name: "Cennge/cennge-ui", average: 4.8, reviews: "64 отзыва" },
];

function Reviews() {
  const [mine, setMine] = useState(0);
  const [docs, setDocs] = useState(3.5);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <ul className="flex flex-col gap-3">
        {repositories.map((repo) => (
          <li key={repo.name} className="flex flex-col gap-1 rounded-medium bg-surface-3 p-3">
            <span className="text-sm font-medium">{repo.name}</span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <Rating isReadOnly value={repo.average} aria-label="Средняя оценка" getValueLabel={ratingLabel} size="sm" />
              {String(repo.average).replace(".", ",")} · {repo.reviews}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-4">
        <Rating
          label="Ваша оценка ai-niche-scout"
          value={mine}
          onValueChange={setMine}
          getValueLabel={ratingLabel}
          description={mine ? ratingLabel(mine) : "Повторный клик по звезде снимает оценку"}
        />
        <Rating
          label="Качество документации"
          allowHalf
          value={docs}
          onValueChange={setDocs}
          getValueLabel={ratingLabel}
          color="primary"
          size="lg"
        />
      </div>
    </div>
  );
}

/** README репозитория так, как его выдаёт рендер Markdown: обычные h2, p, ul, pre, table. */
function Readme() {
  return (
    <Prose className="max-w-prose">
      <h2>cennge-ui</h2>
      <p className="lead">Тактильные React-компоненты в тёмной теме на Radix UI и Tailwind CSS v4.</p>
      <h3>Установка</h3>
      <p>
        Пакет ставится одной командой, стили подключаются одной строкой. Цвета меняются{" "}
        <a href="#theming">атрибутом data-accent</a> или своими переменными <code>--cennge-*</code>.
      </p>
      <pre>
        <code>{["pnpm add cennge-ui", "", '@import "tailwindcss";', '@import "cennge-ui/styles.css";'].join("\n")}</code>
      </pre>
      <ul>
        <li>
          React 18 и 19, <strong>17 тоже работает</strong>.
        </li>
        <li>
          Next.js App Router: <code>"use client"</code> уже в сборке.
        </li>
      </ul>
      <blockquote>
        <p>Обновления вместо копирования: баг исправляется один раз, во всех проектах.</p>
      </blockquote>
      <table>
        <thead>
          <tr>
            <th>Команда</th>
            <th>Что делает</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>pnpm test</code>
            </td>
            <td>Модульные тесты Vitest</td>
          </tr>
          <tr>
            <td>
              <code>pnpm test:e2e</code>
            </td>
            <td>Playwright в Chromium, Firefox и WebKit</td>
          </tr>
        </tbody>
      </table>
    </Prose>
  );
}

const highlights = [
  { title: "Carousel", text: "Нативная прокрутка со снапом: палец, трекпад, клавиатура и перетаскивание мышью.", tone: "bg-primary-bg" },
  { title: "ScrollArea", text: "Полосы прокрутки в цветах темы и затухание у краёв.", tone: "bg-secondary-bg" },
  { title: "Rating", text: "Звёзды как радиогруппа, половинки как слайдер, среднее как картинка.", tone: "bg-warning-bg" },
  { title: "Slider marks", text: "Подписи под дорожкой, клик по подписи и остановка только на метках.", tone: "bg-success-bg" },
  { title: "Prose", text: "README и MDX в цветах темы, без плагина typography.", tone: "bg-info-bg" },
  { title: "Фокус", text: "Кольцо фокуса снова видно у всех элементов, это проверяет e2e.", tone: "bg-danger-bg" },
];

function Highlights() {
  return (
    <Carousel
      aria-label="Что нового"
      labels={{
        carousel: "карусель",
        slide: "слайд",
        slideName: (index, count) => `${index} из ${count}`,
        slides: "Слайды",
        pageName: (index, count) => `Страница ${index} из ${count}`,
        previous: "Назад",
        next: "Вперёд",
        pagination: "Выбор слайда",
        goToSlide: (index) => `Слайд ${index}`,
        goToPage: (index) => `Страница ${index}`,
        pause: "Остановить показ",
        play: "Запустить показ",
      }}
      autoplay
      loop
      // Один слайд на телефоне, два на планшете, три на компьютере — обычными классами.
      className="md:[--carousel-per-view:2] xl:[--carousel-per-view:3]"
    >
      <CarouselContent>
        {highlights.map((item) => (
          <CarouselItem key={item.title}>
            <div className={`flex h-40 flex-col gap-2 rounded-large p-5 ${item.tone}`}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted">{item.text}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselControls />
    </Carousel>
  );
}

export function RepositoryDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Section title="Snippet">
          <Commands />
        </Section>
        <Section title="AlertDialog">
          <DangerZone />
        </Section>
      </div>
      <Section title="Carousel">
        <Highlights />
      </Section>
      <Section title="Rating">
        <Reviews />
      </Section>
      <Section title="Prose">
        <Readme />
      </Section>
    </div>
  );
}
