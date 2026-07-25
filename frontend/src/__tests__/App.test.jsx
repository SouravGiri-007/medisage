import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../firebase/config", () => ({
  auth: {
    onAuthStateChanged: vi.fn((cb) => {
      cb(null);
      return vi.fn();
    }),
  },
}));

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

function renderWithProviders(ui, { initialEntries = ["/"] } = {}) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthProvider>
  );
}

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign in heading", async () => {
    renderWithProviders(<Login />);
    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });
});

describe("Signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create account heading", async () => {
    renderWithProviders(<Signup />);
    expect(await screen.findByRole("heading", { name: /get started/i })).toBeInTheDocument();
  });
});