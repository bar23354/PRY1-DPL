from dataclasses import dataclass

from laboratorio.tokens import simbolo_a_texto
from laboratorio.yalex_parser import YalexLet


class YalexRegexError(ValueError):
    pass


def default_universe() -> set[str]:
    # printable ASCII + common control whitespace
    chars = {chr(i) for i in range(32, 127)}
    chars.update({" ", "\t", "\n", "\r"})
    return chars


@dataclass
class RegexExpr:
    regex: str
    charset: set[str] | None = None
    is_eof: bool = False


@dataclass
class _RegexCursor:
    text: str
    pos: int = 0

    def peek(self) -> str | None:
        return self.text[self.pos] if self.pos < len(self.text) else None

    def take(self) -> str:
        char = self.peek()
        if char is None:
            raise YalexRegexError("Fin inesperado de expresion.")
        self.pos += 1
        return char

    def skip_ws(self) -> None:
        while self.peek() is not None and self.peek().isspace():
            self.pos += 1


def _escaped_literal(char: str) -> str:
    return r"\ε" if char == "ε" else simbolo_a_texto(char)


def _decode_escape(char: str) -> str:
    mapping = {"n": "\n", "t": "\t", "r": "\r", "\\": "\\", "'": "'", '"': '"'}
    return mapping.get(char, char)


def _chars_to_expr(chars: set[str]) -> RegexExpr:
    if not chars:
        raise YalexRegexError("Conjunto vacio no permitido en regex.")
    ordered = sorted(chars)
    if len(ordered) == 1:
        return RegexExpr(regex=_escaped_literal(ordered[0]), charset=set(chars))
    return RegexExpr(regex="(" + "|".join(_escaped_literal(ch) for ch in ordered) + ")", charset=set(chars))


def _read_quoted_char(cur: _RegexCursor) -> str:
    if cur.take() != "'":
        raise YalexRegexError("Se esperaba comilla simple.")
    char = cur.take()
    if char == "\\":
        char = _decode_escape(cur.take())
    if cur.take() != "'":
        raise YalexRegexError("Literal de caracter invalido.")
    return char


def _read_quoted_string(cur: _RegexCursor) -> str:
    if cur.take() != '"':
        raise YalexRegexError('Se esperaba comilla doble.')
    out: list[str] = []
    while True:
        char = cur.take()
        if char == '"':
            return "".join(out)
        if char == "\\":
            char = _decode_escape(cur.take())
        out.append(char)


def _parse_set_item(cur: _RegexCursor) -> tuple[str, str] | set[str]:
    cur.skip_ws()
    ch = cur.peek()
    if ch is None:
        raise YalexRegexError("Conjunto [] sin cierre.")
    if ch == "'":
        left = _read_quoted_char(cur)
        cur.skip_ws()
        if cur.peek() == "-":
            cur.take()
            cur.skip_ws()
            if cur.peek() == "'":
                right = _read_quoted_char(cur)
                return left, right
            right = cur.take()
            return left, right
        return {left}
    if ch == '"':
        return set(_read_quoted_string(cur))
    if ch in {"]"}:
        raise YalexRegexError("Elemento invalido dentro de conjunto.")
    left = cur.take()
    cur.skip_ws()
    if cur.peek() == "-":
        cur.take()
        cur.skip_ws()
        right = cur.take()
        return left, right
    return {left}


def _set_to_expr(cur: _RegexCursor, universe: set[str]) -> RegexExpr:
    if cur.take() != "[":
        raise YalexRegexError("Se esperaba '['.")
    cur.skip_ws()
    negated = False
    if cur.peek() == "^":
        negated = True
        cur.take()
    chars: set[str] = set()
    cur.skip_ws()
    while cur.peek() is not None and cur.peek() != "]":
        item = _parse_set_item(cur)
        if isinstance(item, tuple):
            left, right = item
            if ord(left) > ord(right):
                raise YalexRegexError(f"Rango invalido '{left}'-'{right}'.")
            chars.update(chr(code) for code in range(ord(left), ord(right) + 1))
        else:
            chars.update(item)
        cur.skip_ws()
    if cur.peek() != "]":
        raise YalexRegexError("Conjunto [] sin cierre.")
    cur.take()
    if negated:
        chars = set(universe) - chars
    return _chars_to_expr(chars)


def _parse_identifier(cur: _RegexCursor) -> str:
    out: list[str] = []
    while cur.peek() is not None and (cur.peek().isalnum() or cur.peek() == "_"):
        out.append(cur.take())
    return "".join(out)


def _ensure_not_eof(expr: RegexExpr, ctx: str) -> None:
    if expr.is_eof:
        raise YalexRegexError(f"'eof' no puede usarse dentro de {ctx}.")


def _parse_atom(
    cur: _RegexCursor,
    lets: dict[str, YalexLet],
    universe: set[str],
    stack: tuple[str, ...],
) -> RegexExpr:
    cur.skip_ws()
    ch = cur.peek()
    if ch is None:
        raise YalexRegexError("Fin inesperado de expresion.")
    if ch == "(":
        cur.take()
        expr = _parse_union(cur, lets, universe, stack)
        cur.skip_ws()
        if cur.take() != ")":
            raise YalexRegexError("Falta ')' en expresion.")
        _ensure_not_eof(expr, "expresion parentizada")
        return RegexExpr(regex="(" + expr.regex + ")", charset=expr.charset)
    if ch == "'":
        return RegexExpr(regex=_escaped_literal(_read_quoted_char(cur)))
    if ch == '"':
        value = _read_quoted_string(cur)
        if value == "":
            return RegexExpr(regex="ε")
        # string literal is concatenation
        return RegexExpr(regex="".join(_escaped_literal(c) for c in value))
    if ch == "[":
        return _set_to_expr(cur, universe)
    if ch == "_":
        cur.take()
        return _chars_to_expr(set(universe))
    if ch == "ε":
        cur.take()
        return RegexExpr(regex="ε")
    if ch.isalpha():
        ident = _parse_identifier(cur)
        if ident == "eof":
            return RegexExpr(regex="", is_eof=True)
        if ident not in lets:
            raise YalexRegexError(f"Identificador no definido en let: {ident}")
        if ident in stack:
            raise YalexRegexError(f"Referencia recursiva de let detectada: {' -> '.join(stack + (ident,))}")
        return normalize_regex(lets[ident].pattern, lets, universe=universe, stack=stack + (ident,))
    if ch == "\\":
        cur.take()
        if cur.peek() is None:
            raise YalexRegexError("Escape incompleto en regex.")
        return RegexExpr(regex=_escaped_literal(_decode_escape(cur.take())))
    cur.take()
    return RegexExpr(regex=_escaped_literal(ch))


def _parse_difference(
    cur: _RegexCursor, lets: dict[str, YalexLet], universe: set[str], stack: tuple[str, ...]
) -> RegexExpr:
    left = _parse_atom(cur, lets, universe, stack)
    cur.skip_ws()
    while cur.peek() == "#":
        cur.take()
        right = _parse_atom(cur, lets, universe, stack)
        if left.charset is None or right.charset is None:
            raise YalexRegexError("El operador '#' solo puede aplicarse a conjuntos de caracteres.")
        left = _chars_to_expr(left.charset - right.charset)
        cur.skip_ws()
    return left


def _parse_unary(cur: _RegexCursor, lets: dict[str, YalexLet], universe: set[str], stack: tuple[str, ...]) -> RegexExpr:
    atom = _parse_difference(cur, lets, universe, stack)
    cur.skip_ws()
    while cur.peek() in {"*", "+", "?"}:
        _ensure_not_eof(atom, "operador unario")
        atom = RegexExpr(regex=atom.regex + cur.take())
        cur.skip_ws()
    return atom


def _starts_atom(ch: str | None) -> bool:
    return ch is not None and ch not in {"|", ")"}


def _parse_concat(cur: _RegexCursor, lets: dict[str, YalexLet], universe: set[str], stack: tuple[str, ...]) -> RegexExpr:
    left = _parse_unary(cur, lets, universe, stack)
    cur.skip_ws()
    while _starts_atom(cur.peek()):
        right = _parse_unary(cur, lets, universe, stack)
        _ensure_not_eof(left, "concatenacion")
        _ensure_not_eof(right, "concatenacion")
        left = RegexExpr(regex=left.regex + right.regex)
        cur.skip_ws()
    return left


def _parse_union(cur: _RegexCursor, lets: dict[str, YalexLet], universe: set[str], stack: tuple[str, ...]) -> RegexExpr:
    left = _parse_concat(cur, lets, universe, stack)
    cur.skip_ws()
    while cur.peek() == "|":
        cur.take()
        right = _parse_concat(cur, lets, universe, stack)
        _ensure_not_eof(left, "union")
        _ensure_not_eof(right, "union")
        left = RegexExpr(regex=f"({left.regex}|{right.regex})")
        cur.skip_ws()
    return left


def normalize_regex(
    pattern: str,
    lets: dict[str, YalexLet],
    universe: set[str] | None = None,
    stack: tuple[str, ...] = (),
) -> RegexExpr:
    uni = default_universe() if universe is None else set(universe)
    cur = _RegexCursor(pattern)
    cur.skip_ws()
    if cur.peek() is None:
        raise YalexRegexError("Expresion regular vacia.")
    expr = _parse_union(cur, lets, uni, stack)
    cur.skip_ws()
    if cur.peek() is not None:
        raise YalexRegexError(f"Texto inesperado en regex: {cur.text[cur.pos:]!r}")
    return expr
