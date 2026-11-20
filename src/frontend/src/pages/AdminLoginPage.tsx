import {
  FormCard,
  PublicHeader,
  PublicPageTitle,
} from "@/components/layout/PublicHeader";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { Field, TextField } from "@/components/shared/Field";
import { useAdminSignIn } from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";

/** Administrator master-key entry point; opens the admin panel on success. */
export function AdminLoginPage() {
  const [masterKey, setMasterKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const signIn = useAdminSignIn();
  const setAdmin = useSession((state) => state.setAdmin);
  const navigate = useNavigate();

  const trimmed = masterKey.trim();
  const canSubmit = trimmed.length > 0 && !signIn.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    signIn.mutate(trimmed, {
      onSuccess: (session) => {
        if (!session) {
          setError("Clave maestra incorrecta. Verifica e intenta de nuevo.");
          return;
        }
        setAdmin(session);
        setMasterKey("");
        void navigate({ to: "/admin", replace: true });
      },
      onError: () => {
        setError(
          "No pudimos validar la clave. Revisa tu conexión e intenta otra vez.",
        );
      },
    });
  }

  return (
    <div data-ocid="admin_login.page" className="animate-fade-up">
      <PublicHeader backTo="/" />
      <PublicPageTitle
        title="Acceso administrador"
        description="Ingresa la clave maestra para gestionar clientes, pagos y cobertura."
      />
      <FormCard>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-primary-lift">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Área restringida al personal de Cajigalnet. La sesión caduca
              automáticamente por seguridad.
            </p>
          </div>

          <Field
            label="Clave maestra"
            htmlFor="admin-master-key"
            error={error ?? undefined}
          >
            <TextField
              id="admin-master-key"
              data-ocid="admin_login.master_key_input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={masterKey}
              onChange={(event) => {
                setMasterKey(event.target.value);
                if (error) setError(null);
              }}
              aria-invalid={error ? true : undefined}
              autoFocus
            />
          </Field>

          {error ? (
            <div
              data-ocid="admin_login.error_state"
              className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}

          <PrimaryButton
            type="submit"
            data-ocid="admin_login.submit_button"
            disabled={!canSubmit}
            className="disabled:opacity-60"
          >
            {signIn.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Validando…
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" aria-hidden="true" />
                Entrar al panel
              </>
            )}
          </PrimaryButton>
        </form>
      </FormCard>
    </div>
  );
}
