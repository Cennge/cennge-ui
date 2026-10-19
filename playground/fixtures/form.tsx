import { useActionState, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  PasswordInput,
  Radio,
  RadioGroup,
  Rating,
  Select,
  SelectItem,
} from "cennge-ui";

type Errors = Record<string, string>;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** What a server would say about a sign-up that passed the browser's checks. */
function checkOnServer(data: FormData): Errors | null {
  const errors: Errors = {};
  if (data.get("username") === "admin") errors.username = "This username is taken";
  if (!data.get("launch")) errors.launch = "Pick a launch date";
  if (!data.get("rating")) errors.rating = "Rate the release before saving";
  return Object.keys(errors).length ? errors : null;
}

function SignUp() {
  const [errors, setErrors] = useState<Errors | undefined>();
  const [result, setResult] = useState("");
  const [isPending, setPending] = useState(false);

  return (
    <Form
      aria-label="Sign up"
      validationErrors={errors}
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        await wait(150);
        const found = checkOnServer(data);
        setPending(false);
        setErrors(found ?? undefined);
        setResult(found ? "rejected" : "saved");
      }}
      className="flex flex-col gap-4"
    >
      <Input name="email" label="Email" type="email" isRequired />
      <Input name="username" label="Username" description="Letters and digits" />
      <PasswordInput name="password" label="Password" minLength={8} isRequired />
      <Select name="plan" label="Plan" isRequired placeholder="Choose a plan">
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
      </Select>
      <RadioGroup name="visibility" label="Visibility" orientation="horizontal" isRequired>
        <Radio value="public">Public</Radio>
        <Radio value="private">Private</Radio>
      </RadioGroup>
      <DatePicker name="launch" label="Launch date" />
      <Rating name="rating" label="Rate the release" />
      <Checkbox name="terms" isRequired>
        I agree to the terms
      </Checkbox>
      <Button type="submit" color="primary" isLoading={isPending} className="self-start">
        Create account
      </Button>
      <p>
        result: <span data-testid="result">{result}</span>
      </p>
    </Form>
  );
}

interface RenameState {
  error?: string;
  name: string;
  renamed?: boolean;
}

/** A React 19 action, the way a Next.js server action is used. */
async function rename(_previous: RenameState, data: FormData): Promise<RenameState> {
  await wait(150);
  const name = String(data.get("repo") ?? "");
  if (name === "cennge-ui") return { name, error: "A repository with this name already exists" };
  return { name, renamed: true };
}

function Rename() {
  const [state, action, isPending] = useActionState(rename, { name: "cennge-ui" });
  return (
    <Form aria-label="Rename" action={action} validationErrors={state.error ? { repo: state.error } : undefined} className="flex flex-col gap-4">
      {/* React resets the form after an action: defaultValue from the state keeps what was typed. */}
      <Input name="repo" label="Repository name" defaultValue={state.name} key={state.name} />
      <Button type="submit" isLoading={isPending} className="self-start">
        Rename
      </Button>
      <p>
        renamed: <span data-testid="renamed">{state.renamed ? state.name : ""}</span>
      </p>
    </Form>
  );
}

export default function FormFixture() {
  return (
    <>
      <SignUp />
      <Rename />
    </>
  );
}
