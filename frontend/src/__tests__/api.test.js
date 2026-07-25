import { describe, it, expect, vi } from "vitest";

describe("api utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("get makes a GET request with auth header", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      headers: new Map([["content-type", "application/json"]]),
      json: () => Promise.resolve({ data: "ok" }),
    });

    const api = (await import("../utils/api")).default;
    const result = await api.get("/test", "mytoken");
    expect(result).toEqual({ data: "ok" });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer mytoken" }),
      })
    );
  });

  it("post sends JSON body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      headers: new Map([["content-type", "application/json"]]),
      json: () => Promise.resolve({ success: true }),
    });

    const api = (await import("../utils/api")).default;
    const result = await api.post("/test", { foo: "bar" }, "token");
    expect(result).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ foo: "bar" }),
      })
    );
  });

  it("postForm sends FormData", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      headers: new Map([["content-type", "application/json"]]),
      json: () => Promise.resolve({ success: true }),
    });

    const api = (await import("../utils/api")).default;
    const form = new FormData();
    form.append("key", "value");
    const result = await api.postForm("/upload", form, "token");
    expect(result).toEqual({ success: true });
  });

  it("handles non-JSON error response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      headers: new Map([["content-type", "text/html"]]),
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.reject(new Error("not json")),
    });

    const api = (await import("../utils/api")).default;
    const result = await api.get("/fail", "token");
    expect(result.error).toContain("Server error (500)");
  });
});