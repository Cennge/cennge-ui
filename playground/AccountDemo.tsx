import { useState, type ReactNode } from "react";
import { Button, Input, PasswordInput, Progress, toast, type CenngeColor } from "cennge-ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-large bg-surface-2 p-6 shadow-raised">
      <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}

const passwordLabels = { toggleLabel: "Показать пароль", capsLockWarning: "Включён Caps Lock" };

/* A rough score for the demo: length and character variety. Real apps should use zxcvbn or a server check. */
function strengthOf(password: string): { score: number; label: string; color: CenngeColor } {
  const variety = [/[a-zа-яё]/, /[A-ZА-ЯЁ]/, /\d/, /[^\p{L}\d]/u].filter((pattern) => pattern.test(password)).length;
  const score = Math.min(4, Math.floor(password.length / 4) + variety - 1);
  if (password.length === 0) return { score: 0, label: "", color: "default" };
  if (score <= 1) return { score: 1, label: "Слабый", color: "danger" };
  if (score === 2) return { score: 2, label: "Средний", color: "warning" };
  if (score === 3) return { score: 3, label: "Хороший", color: "info" };
  return { score: 4, label: "Надёжный", color: "success" };
}

function Passwords() {
  const [newPassword, setNewPassword] = useState("");
  const strength = strengthOf(newPassword);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          toast.success("Вход выполнен", { description: "Пароль снова скрыт после отправки формы" });
        }}
      >
        <Input label="Email" type="email" autoComplete="username" defaultValue="dev@example.com" />
        <PasswordInput label="Пароль" name="password" {...passwordLabels} />
        <Button type="submit" color="primary" className="self-start">
          Войти
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <PasswordInput
          label="Новый пароль"
          autoComplete="new-password"
          variant="bordered"
          value={newPassword}
          onValueChange={setNewPassword}
          description="Минимум 12 символов. Включите Caps Lock и начните печатать."
          {...passwordLabels}
        />
        <Progress
          aria-label="Надёжность пароля"
          value={strength.score}
          max={4}
          color={strength.color}
          size="sm"
          label={strength.label || "Надёжность пароля"}
          formatValue={(value) => `${value} из 4`}
        />
      </div>
    </div>
  );
}

export function AccountDemo() {
  return (
    <Section title="PasswordInput">
      <Passwords />
    </Section>
  );
}
