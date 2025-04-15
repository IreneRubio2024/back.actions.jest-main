import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import CreateAccountPage from "./page";

global.fetch = jest.fn(() => Promise.resolve({ ok: true }));

test("calls createNewAccount with correct data", async () => {
  render(<CreateAccountPage />);

  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target: { value: "testUser" },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: "testPassword" },
  });
  fireEvent.click(screen.getByText("Create Account"));

  expect(fetch).toHaveBeenCalledWith("http://localhost:3006/createAccount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testUser", password: "testPassword" }),
  });
});
