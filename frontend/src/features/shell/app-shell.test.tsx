import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "./app-shell";


describe("AppShell", () => {
  it("renders the dashboard as the default active module", () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: "Proyecto 01 - Interfaz Integrada" })).toBeInTheDocument();
    expect(screen.getByTestId("active-title")).toHaveTextContent("Dashboard General");
    expect(screen.queryByTitle("Interfaz de modulo")).not.toBeInTheDocument();
  });

  it("switches the active module without using an iframe", async () => {
    const user = userEvent.setup();
    render(<AppShell />);

    await user.click(screen.getByRole("button", { name: /lexical generator/i }));

    expect(screen.getByTestId("active-title")).toHaveTextContent("Lexical Generator");
    expect(screen.getByRole("button", { name: /generate diagram/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir vista independiente" })).toHaveAttribute(
      "href",
      "../legacy/web/interfaz/lexical_generator/code.html",
    );
  });
});
