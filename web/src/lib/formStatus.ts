export type FormState = "idle" | "submitting" | "success" | "error";

export const MISSING_CONFIG_MESSAGE =
  "PocketBase is not configured. Set PUBLIC_POCKETBASE_URL and rebuild.";

export function setFormStatus(root: HTMLElement, state: FormState, message = "") {
  const status = root.querySelector<HTMLElement>("[data-form-status]");
  const submit = root.querySelector<HTMLButtonElement>('button[type="submit"]');
  root.dataset.state = state;
  if (submit) submit.disabled = state === "submitting";
  if (status) {
    status.textContent = message;
    status.hidden = message === "";
    status.dataset.tone = state;
  }
}
