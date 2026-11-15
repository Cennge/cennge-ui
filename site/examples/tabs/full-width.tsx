"use client";

import { Button, Input, PasswordInput, Tabs, TabsContent, TabsList, TabsTrigger } from "cennge-ui";

export default function AccountTabs() {
  return (
    <Tabs defaultValue="sign-in" fullWidth className="w-full max-w-sm">
      <TabsList aria-label="Account">
        <TabsTrigger value="sign-in">Sign in</TabsTrigger>
        <TabsTrigger value="create">Create account</TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in" className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="dev@example.com" />
        <PasswordInput label="Password" />
        <Button color="primary">Sign in</Button>
      </TabsContent>
      <TabsContent value="create" className="flex flex-col gap-4">
        <Input label="Email" type="email" autoComplete="email" placeholder="dev@example.com" />
        <PasswordInput label="Password" autoComplete="new-password" />
        <Button color="primary">Create account</Button>
      </TabsContent>
    </Tabs>
  );
}
