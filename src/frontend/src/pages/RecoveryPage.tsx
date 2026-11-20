import {
  FormCard,
  PublicHeader,
  PublicPageTitle,
} from "@/components/layout/PublicHeader";
import { PrimaryButton } from "@/components/shared/ActionButtons";
import { InlineError } from "@/components/shared/ErrorState";
import { Field, TextField } from "@/components/shared/Field";
import { ToneBadge } from "@/components/shared/StatusBadge";
import {
  useClientSignIn,
  useRequestPasswordRecovery,
  useResetPassword,
} from "@/hooks/useQueries";
import { useSession } from "@/lib/session";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

type Step = "request" | "reset";

/** Password recovery: request a WhatsApp code, then reset with it. */
export function RecoveryPage() {
  const [step, setStep] = useState<Step>("request");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const requestRecovery = useRequestPasswordRecovery();
  const resetPassword = useResetPassword();
  const signIn = useClientSignIn();
  const setClient = useSession((state) => state.setClient);
  const navigate = useNavigate();

  const canRequest =
    phone.trim().length > 0 &&
    cedula.trim().length > 0 &&
    !requestRecovery.isPending;
  const canReset =
    code.trim().length > 0 &&
    newPassword.length >= 4 &&
    confirmPassword.length > 0 &&
    !resetPassword.isPending &&
    !signIn.isPending;

  function handleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canRequest) return;
    setRequestError(null);
    requestRecovery.mutate(
      { phone: phone.trim(), cedula: cedula.trim() },
      {
        onSuccess: (ticket) => {
          if (!ticket) {
            setRequestError(
              "Ese teléfono no está registrado con la cédula indicada. Verifica los datos o escríbenos por WhatsApp a nuestro canal de soporte.",
            );
            return;
          }
          setStep("reset");
          if (ticket.whatsappUrl) {
            window.open(ticket.whatsappUrl, "_blank", "noopener,noreferrer");
          }
          toast.success("Código generado", {
            description:
              "Abrimos WhatsApp con tu código e instrucciones. Envíalo para recibirlo.",
          });
        },
        onError: () => {
          setRequestError(
            "No pudimos conectar con el sistema. Revisa tu conexión e intenta de nuevo.",
          );
        },
      },
    );
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canReset) return;
    setResetError(null);
    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden. Escríbelas de nuevo.");
      return;
    }
    resetPassword.mutate(
      { phone: phone.trim(), code: code.trim(), newPassword },
      {
        onSuccess: (ok) => {
          if (!ok) {
            setResetError(
              "El código no es válido para este teléfono. Revisa el mensaje de WhatsApp e inténtalo otra vez.",
            );
            return;
          }
          signIn.mutate(
            { identifier: phone.trim(), password: newPassword },
            {
              onSuccess: (client) => {
                if (!client) {
                  toast.success("Contraseña actualizada", {
                    description: "Ya puedes ingresar con tu nueva contraseña.",
                  });
                  void navigate({ to: "/ingresar" });
                  return;
                }
                setClient(client);
                void navigate({ to: "/app" });
              },
              onError: () => {
                toast.success("Contraseña actualizada", {
                  description: "Ingresa con tu nueva contraseña.",
                });
                void navigate({ to: "/ingresar" });
              },
            },
          );
        },
        onError: () => {
          setResetError(
            "No pudimos conectar con el sistema. Revisa tu conexión e intenta de nuevo.",
          );
        },
      },
    );
  }

  return (
    <div data-ocid="recovery.page">
      <PublicHeader backTo="/ingresar" />
      <PublicPageTitle
        title="Recuperar contraseña"
        description="Te enviamos un código por WhatsApp para restablecer tu acceso."
      />

      <div className="mb-4 flex items-center gap-2">
        <ToneBadge tone={step === "request" ? "primary" : "neutral"}>
          1. Verificar datos
        </ToneBadge>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <ToneBadge tone={step === "reset" ? "primary" : "neutral"}>
          2. Nueva contraseña
        </ToneBadge>
      </div>

      {step === "request" ? (
        <FormCard>
          <form onSubmit={handleRequest} className="space-y-4" noValidate>
            <Field
              label="Teléfono registrado"
              htmlFor="recovery-phone"
              hint="Formato 0414-1234567"
            >
              <TextField
                id="recovery-phone"
                data-ocid="recovery.phone_input"
                placeholder="0414-1234567"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={requestRecovery.isPending}
              />
            </Field>
            <Field label="Cédula" htmlFor="recovery-cedula">
              <TextField
                id="recovery-cedula"
                data-ocid="recovery.cedula_input"
                placeholder="V-12345678"
                inputMode="numeric"
                value={cedula}
                onChange={(event) => setCedula(event.target.value)}
                disabled={requestRecovery.isPending}
              />
            </Field>
            {requestError && <InlineError message={requestError} />}
            <PrimaryButton
              type="submit"
              data-ocid="recovery.submit_button"
              disabled={!canRequest}
              className="disabled:opacity-60"
            >
              {requestRecovery.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <MessageCircle className="size-4" aria-hidden="true" />
              )}
              {requestRecovery.isPending
                ? "Generando código…"
                : "Enviar código por WhatsApp"}
            </PrimaryButton>
          </form>
        </FormCard>
      ) : (
        <FormCard>
          <div
            data-ocid="recovery.success_state"
            className="mb-4 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5"
          >
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground">
              Enviamos el código a tu WhatsApp registrado. Escríbelo junto con
              tu nueva contraseña.
            </p>
          </div>
          <form onSubmit={handleReset} className="space-y-4" noValidate>
            <Field
              label="Código de recuperación"
              htmlFor="recovery-code"
              hint="Ejemplo: CG12-3"
            >
              <TextField
                id="recovery-code"
                data-ocid="recovery.code_input"
                placeholder="CG12-3"
                autoCapitalize="characters"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                disabled={resetPassword.isPending || signIn.isPending}
              />
            </Field>
            <Field label="Nueva contraseña" htmlFor="recovery-new-password">
              <TextField
                id="recovery-new-password"
                data-ocid="recovery.new_password_input"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={resetPassword.isPending || signIn.isPending}
              />
            </Field>
            <Field
              label="Confirmar contraseña"
              htmlFor="recovery-confirm-password"
            >
              <TextField
                id="recovery-confirm-password"
                data-ocid="recovery.confirm_password_input"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={resetPassword.isPending || signIn.isPending}
              />
            </Field>
            {resetError && <InlineError message={resetError} />}
            <PrimaryButton
              type="submit"
              data-ocid="recovery.reset_button"
              disabled={!canReset}
              className="disabled:opacity-60"
            >
              {resetPassword.isPending || signIn.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {resetPassword.isPending || signIn.isPending
                ? "Guardando…"
                : "Guardar y entrar"}
            </PrimaryButton>
            <button
              type="button"
              data-ocid="recovery.back_button"
              onClick={() => {
                setStep("request");
                setResetError(null);
              }}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Usar otro teléfono
            </button>
          </form>
        </FormCard>
      )}

      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        <Link
          to="/ingresar"
          data-ocid="recovery.signin_link"
          className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline"
        >
          <KeyRound className="size-4" aria-hidden="true" />
          Volver a ingresar
        </Link>
      </div>
    </div>
  );
}
