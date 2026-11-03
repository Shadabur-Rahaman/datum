import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, vi, beforeEach } from "vitest";
import { PasswordAuth } from "./PasswordAuth";
const api = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("../../services/supabase", () => ({ supabase: { auth: api } }));
beforeEach(() => {
  Object.values(api).forEach((fn) =>
    fn.mockReset().mockResolvedValue({ data: { session: null }, error: null }),
  );
});
it("submits signup credentials and waits for real email verification", async () => {
  render(<PasswordAuth />);
  await userEvent.click(screen.getByRole("button", { name: "Create account" }));
  await userEvent.type(
    screen.getByLabelText("Email for password account"),
    "student@example.test",
  );
  await userEvent.type(
    screen.getByLabelText("Password", { exact: true }),
    "strong-pass-42",
  );
  await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
  expect(api.signUp).toHaveBeenCalledWith(
    expect.objectContaining({
      email: "student@example.test",
      password: "strong-pass-42",
      options: { emailRedirectTo: expect.stringContaining("#/settings") },
    }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("verification link");
});
it("reports invalid login without claiming a session", async () => {
  api.signInWithPassword.mockResolvedValue({
    error: new Error("Invalid login credentials"),
  });
  render(<PasswordAuth />);
  await userEvent.type(
    screen.getByLabelText("Email for password account"),
    "student@example.test",
  );
  await userEvent.type(
    screen.getByLabelText("Password", { exact: true }),
    "wrong-pass-42",
  );
  await userEvent.click(screen.getByRole("button", { name: "Log in" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid login");
});
it("requests a reset with a Pages-compatible callback and updates a signed-in password", async () => {
  const view = render(<PasswordAuth />);
  await userEvent.click(
    screen.getByRole("button", { name: "Forgot password" }),
  );
  await userEvent.type(
    screen.getByLabelText("Email for password account"),
    "student@example.test",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Send reset link" }),
  );
  expect(api.resetPasswordForEmail).toHaveBeenCalledWith(
    "student@example.test",
    { redirectTo: expect.stringContaining("#/settings") },
  );
  view.unmount();
  render(<PasswordAuth signedIn />);
  await userEvent.type(screen.getByLabelText("New password"), "new-strong-42");
  await userEvent.click(
    screen.getByRole("button", { name: "Update password" }),
  );
  expect(api.updateUser).toHaveBeenCalledWith({ password: "new-strong-42" });
});
