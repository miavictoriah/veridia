import { describe, it, expect, beforeEach } from "vitest";
import { showToast } from "./Toast";

describe("Toast notifications", () => {
  beforeEach(() => {
    // Clear any previous toasts
    vi.clearAllMocks();
  });

  it("should create a success toast", () => {
    const id = showToast("Success message", "success");
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("should create an error toast", () => {
    const id = showToast("Error message", "error");
    expect(id).toBeDefined();
  });

  it("should create an info toast by default", () => {
    const id = showToast("Info message");
    expect(id).toBeDefined();
  });

  it("should create a warning toast", () => {
    const id = showToast("Warning message", "warning");
    expect(id).toBeDefined();
  });

  it("should accept custom duration", () => {
    const id = showToast("Message", "info", 5000);
    expect(id).toBeDefined();
  });
});
