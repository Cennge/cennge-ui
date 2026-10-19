import { useActionState, useState, type ReactNode } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  OtpInput,
  PasswordInput,
  Progress,
  Select,
  SelectItem,
  toast,
  type CenngeColor,
} from "cennge-ui";

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
    <div className="grid gap-6">
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

const digitLabel = (position: number, length: number) => `Цифра ${position} из ${length}`;

function TwoFactor() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "invalid">("idle");

  const verify = (value: string) => {
    setStatus("checking");
    setTimeout(() => {
      if (value === "246810") {
        setStatus("idle");
        setCode("");
        toast.success("Двухфакторная аутентификация включена");
      } else {
        setStatus("invalid");
      }
    }, 700);
  };

  return (
    <div className="flex flex-col gap-6">
      <OtpInput
        label="Код из приложения-аутентификатора"
        description={status === "checking" ? "Проверяю…" : "Для проверки введите 246810 или вставьте код целиком"}
        errorMessage="Неверный код. Попробуйте ещё раз."
        isInvalid={status === "invalid"}
        isReadOnly={status === "checking"}
        value={code}
        onValueChange={(value) => {
          setCode(value);
          if (status === "invalid") setStatus("idle");
        }}
        onComplete={verify}
        groupSize={3}
        formatSlotLabel={digitLabel}
      />
      <div className="flex flex-wrap items-start gap-6">
        <OtpInput label="PIN-код" length={4} isMasked size="sm" variant="bordered" formatSlotLabel={digitLabel} />
        <OtpInput
          label="Код восстановления"
          length={8}
          allowedCharacters="alphanumeric"
          size="sm"
          variant="faded"
          formatSlotLabel={(position, length) => `Символ ${position} из ${length}`}
        />
      </div>
    </div>
  );
}

interface InviteState {
  errors?: Record<string, string>;
  values?: { login?: string; role?: string };
}

/** Как server action в Next.js: получает FormData, возвращает ошибки по именам полей. */
async function inviteCollaborator(_previous: InviteState, data: FormData): Promise<InviteState> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const login = String(data.get("login") ?? "").trim();
  const values = { login, role: String(data.get("role") ?? "") };
  if (login.toLowerCase() === "admin") return { values, errors: { login: "Такого пользователя нет на GitHub" } };
  if (login === "Cennge") return { values, errors: { login: "Это владелец репозитория" } };
  toast.success("Приглашение отправлено", { description: `${login} · ai-niche-scout` });
  return {};
}

function Invite() {
  const [state, action, isPending] = useActionState(inviteCollaborator, {});
  return (
    <Form action={action} validationErrors={state.errors} className="flex flex-col gap-4">
      {/* key: после action React сбрасывает форму, а defaultValue из состояния сохраняет введённое */}
      <Input
        key={`login-${state.values?.login ?? ""}`}
        name="login"
        label="Логин на GitHub"
        defaultValue={state.values?.login}
        description="Попробуйте admin — сервер вернёт ошибку"
        isRequired
        minLength={2}
      />
      <Select key={`role-${state.values?.role ?? ""}`} name="role" label="Роль" defaultValue={state.values?.role} isRequired placeholder="Выберите роль">
        <SelectItem value="read">Чтение</SelectItem>
        <SelectItem value="write">Запись</SelectItem>
        <SelectItem value="maintain">Сопровождение</SelectItem>
      </Select>
      <Checkbox name="notify" defaultSelected>
        Отправить письмо с приглашением
      </Checkbox>
      <Button type="submit" color="primary" isLoading={isPending} className="self-start">
        Пригласить
      </Button>
    </Form>
  );
}

export function AccountDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Section title="PasswordInput">
        <Passwords />
      </Section>
      <Section title="OtpInput">
        <TwoFactor />
      </Section>
      <Section title="Form + server action">
        <Invite />
      </Section>
    </div>
  );
}
