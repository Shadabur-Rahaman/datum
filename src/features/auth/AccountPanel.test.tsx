import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, it, expect, vi } from "vitest";
import { AccountPanel } from "./AccountPanel";
const api = vi.hoisted(() => ({ send: vi.fn(), verify: vi.fn() }));
vi.mock("../../services/supabase", () => ({
  configurationMessage: "",
  supabase: { auth: { signInWithOtp: api.send, verifyOtp: api.verify } },
}));
vi.mock("./AuthProvider", () => ({
  useAuth: () => ({ user: null, loading: false, error: "", retry: vi.fn() }),
}));
beforeEach(() => {
  api.send.mockReset().mockResolvedValue({ error: null });
  api.verify.mockReset().mockResolvedValue({ error: null });
});
it("requests a code and verifies the actual supplied OTP with email type", async () => {
  render(<AccountPanel />);
  await userEvent.type(
    screen.getByLabelText("Email address"),
    "learner@example.test",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Send sign-in code" }),
  );
  expect(api.send).toHaveBeenCalledWith({
    email: "learner@example.test",
    options: { shouldCreateUser: true },
  });
  await userEvent.type(screen.getByLabelText("Email sign-in code"), "123456");
  await userEvent.click(screen.getByRole("button", { name: "Verify code" }));
  await waitFor(() =>
    expect(api.verify).toHaveBeenCalledWith({
      email: "learner@example.test",
      token: "123456",
      type: "email",
    }),
  );
});
it("reports delivery/rate failures and permits another request", async () => {
  api.send.mockResolvedValueOnce({
    error: { message: "Email rate limit exceeded" },
  });
  render(<AccountPanel />);
  await userEvent.type(
    screen.getByLabelText("Email address"),
    "learner@example.test",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Send sign-in code" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("rate limit");
  expect(screen.queryByLabelText("Email sign-in code")).not.toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "Send sign-in code" }),
  );
  expect(await screen.findByLabelText("Email sign-in code")).toBeVisible();
});
it("never claims successful authentication for expired codes", async () => {
  api.verify.mockResolvedValueOnce({ error: { message: "Token has expired" } });
  render(<AccountPanel />);
  await userEvent.type(
    screen.getByLabelText("Email address"),
    "learner@example.test",
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Send sign-in code" }),
  );
  await userEvent.type(screen.getByLabelText("Email sign-in code"), "123456");
  await userEvent.click(screen.getByRole("button", { name: "Verify code" }));
  expect(screen.getByRole("alert")).toHaveTextContent("expired");
  expect(screen.queryByText("SIGNED IN")).not.toBeInTheDocument();
});
