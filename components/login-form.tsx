"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp, type AuthActionState } from "@/app/(admin)/login/actions";

const initialState: AuthActionState = { error: null };

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInAction : signUpAction;
  const pending = mode === "signin" ? signInPending : signUpPending;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{mode === "signin" ? "Ingresar al panel" : "Crear cuenta"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input type="email" name="email" required />
          </div>
          <div>
            <Label className="mb-1 block">Contraseña</Label>
            <Input type="password" name="password" required minLength={6} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state.message && <p className="text-sm text-muted-foreground">{state.message}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {mode === "signin" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-muted-foreground underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "¿No tenés cuenta? Crear una" : "Ya tengo cuenta, ingresar"}
        </button>
      </CardContent>
    </Card>
  );
}
