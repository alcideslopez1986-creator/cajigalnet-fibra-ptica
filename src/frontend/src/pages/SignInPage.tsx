import {
  FormCard,
  PublicHeader,
  PublicPageTitle,
} from "@/components/layout/PublicHeader";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { InlineError } from "@/components/shared/ErrorState";
import { Field, TextField } from "@/components/shared/Field";
import { useClientSignIn } from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

/** Client sign-in: cédula, phone or username plus password. */
export function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signIn = useClientSignIn();
  const setClient = useSession((state) => state.setClient);
  const navigate = useNavigate();

  const canSubmit =
    identifier.trim().length > 0 && password.length > 0 && !signIn.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    signIn.mutate(
      { identifier: identifier.trim(), password },
      {
        onSuccess: (client) => {
          if (!client) {
            setError(
              "Los datos no coinciden con ningún cliente. Revisa tu cédula, teléfono o usuario y la contraseña.",
            );
            return;
          }
          setClient(client);
          void navigate({ to: "/app" });
        },
        onError: () => {
          setError(
            "No pudimos conectar con el sistema. Revisa tu conexión e intenta de nuevo.",
          );
        },
      },
    );
  }

  return (
    <div data-ocid="signin.page">
      <PublicHeader backTo="/" />
      <PublicPageTitle
        title="Ingresar a tu cuenta"
        description="Usa tu cédula, teléfono o usuario para ver tu estado de cuenta."
      />
      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field label="Cédula, teléfono o usuario" htmlFor="signin-identifier">
            <TextField
              id="signin-identifier"
              data-ocid="signin.identifier_input"
              placeholder="V-12345678"
              autoComplete="username"
              autoCapitalize="none"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              disabled={signIn.isPending}
            />
          </Field>
          <Field label="Contraseña" htmlFor="signin-password">
            <TextField
              id="signin-password"
              data-ocid="signin.password_input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={signIn.isPending}
            />
          </Field>
          {error && <InlineError message={error} />}
          <PrimaryButton
            type="submit"
            data-ocid="signin.submit_button"
            disabled={!canSubmit}
            className="disabled:opacity-60"
          >
            {signIn.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="size-4" aria-hidden="true" />
            )}
            {signIn.isPending ? "Verificando…" : "Entrar"}
          </PrimaryButton>
        </form>
      </FormCard>
      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <Link
          to="/recuperar"
          data-ocid="signin.recovery_link"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          to="/admin/login"
          data-ocid="signin.admin_link"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Acceso administrador
        </Link>
      </div>
    </div>
  );
}
