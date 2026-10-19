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
  Input,
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
    <div className="grid gap-6 sm:grid-cols-2">
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

export function RepositoryDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Snippet">
          <Commands />
        </Section>
        <Section title="AlertDialog">
          <DangerZone />
        </Section>
      </div>
      <Section title="Rating">
        <Reviews />
      </Section>
    </div>
  );
}
