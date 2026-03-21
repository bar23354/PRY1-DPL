from __future__ import annotations

import os

import uvicorn

from generador_lexico.api import create_app


def main() -> None:
    host = os.environ.get("GENERADOR_LEXICO_API_HOST", "127.0.0.1")
    port = int(os.environ.get("GENERADOR_LEXICO_API_PORT", "8000"))
    app = create_app()
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
