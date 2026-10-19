"use client";

import { useActionState, useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Form, Input, toast } from "cennge-ui";
import { saveRepository } from "./actions";

/** A server action: its errors land under their fields, and success shows a toast from the Toaster in the layout. */
export function ActionForm() {
  const [state, action, isPending] = useActionState(saveRepository, {});

  useEffect(() => {
    if (state.saved) toast.success(`Saved ${state.saved}`);
  }, [state]);

  return (
    <Card>
      <CardHeader className="font-semibold">Server action</CardHeader>
      <CardBody>
        <Form
          action={action}
          validationErrors={state.errors}
          aria-label="Server action"
          className="flex items-end gap-2"
        >
          {/* React resets the form after the action: keep what was typed. */}
          <Input
            key={state.repository}
            name="repository"
            label="GitHub repository"
            defaultValue={state.repository}
            isRequired
            className="flex-1"
          />
          <Button type="submit" color="primary" isLoading={isPending}>
            Save
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
}
