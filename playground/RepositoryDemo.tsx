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

export function RepositoryDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section title="AlertDialog">
        <DangerZone />
      </Section>
    </div>
  );
}
