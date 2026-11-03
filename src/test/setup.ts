import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";
import { recovery } from "../features/persistence/recovery";
beforeEach(() => {
  localStorage.clear();
  recovery.clear();
});
afterEach(cleanup);
