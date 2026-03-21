from dataclasses import dataclass


@dataclass(frozen=True)
class YalexLet:
    name: str
    pattern: str


@dataclass(frozen=True)
class YalexRule:
    pattern: str
    action: str
    index: int


@dataclass(frozen=True)
class YalexSpec:
    header: str
    trailer: str
    lets: dict[str, YalexLet]
    entrypoint: str
    args: list[str]
    rules: list[YalexRule]

class YalexSyntaxError(ValueError):
    pass

def _strip_comments(text: str) -> str:
    # comments in yalex are delimited by (* ... *)
    out: list[str] = []
    i = 0
    while i < len(text):
        if i + 1 < len(text) and text[i] == "(" and text[i + 1] == "*":
            i += 2
            while i + 1 < len(text) and not (text[i] == "*" and text[i + 1] == ")"):
                i += 1
            if i + 1 >= len(text):
                raise YalexSyntaxError("Comentario sin cierre en archivo .yal.")
            i += 2
            continue
        out.append(text[i])
        i += 1
    return "".join(out)


def _extract_brace_block(text: str, start: int) -> tuple[str, int]:
    if start >= len(text) or text[start] != "{":
        raise YalexSyntaxError("Se esperaba '{' para abrir bloque.")
    depth = 0
    for index in range(start, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start + 1:index], index + 1
    raise YalexSyntaxError("Bloque con llaves sin cierre.")


def _consume_optional_header(lines: list[str], raw_text: str) -> tuple[str, list[str]]:
    first_non_empty = next((line for line in lines if line.strip()), "")
    if not first_non_empty.startswith("{"):
        return "", lines

    block, end_pos = _extract_brace_block(raw_text, raw_text.index("{"))
    tail = raw_text[end_pos:]
    return block, tail.splitlines()

def _parse_lets(lines: list[str]) -> tuple[dict[str, YalexLet], int]:
    lets: dict[str, YalexLet] = {}
    cursor = 0
    while cursor < len(lines):
        line = lines[cursor]
        if not line.strip():
            cursor += 1
            continue
        if line.strip().startswith("rule "):
            break
        stripped = line.strip()
        if not stripped.startswith("let "):
            raise YalexSyntaxError(f"Definicion invalida antes de rule: {line.strip()!r}")
        after_let = stripped[4:].strip()
        if "=" not in after_let:
            raise YalexSyntaxError(f"Definicion let invalida: {line.strip()!r}")
        name, pattern = after_let.split("=", 1)
        name = name.strip()
        pattern = pattern.strip()
        if not name or not (name[0].isalpha() or name[0] == "_") or any(not (c.isalnum() or c == "_") for c in name):
            raise YalexSyntaxError(f"Identificador let invalido: {name!r}")
        if not pattern:
            raise YalexSyntaxError(f"Definicion let sin expresion: {line.strip()!r}")
        lets[name] = YalexLet(name=name, pattern=pattern)
        cursor += 1
    return lets, cursor

def _parse_rule_header(line: str) -> tuple[str, list[str]]:
    stripped = line.strip()
    if not stripped.startswith("rule "):
        raise YalexSyntaxError("Cabecera de rule invalida.")
    body = stripped[5:].strip()
    if "=" not in body:
        raise YalexSyntaxError("Cabecera de rule invalida: falta '='.")
    left, tail = body.split("=", 1)
    if tail.strip():
        raise YalexSyntaxError("Cabecera de rule invalida: texto extra despues de '='.")
    left = left.strip()
    if not left:
        raise YalexSyntaxError("Cabecera de rule invalida: falta entrypoint.")

    if "[" not in left:
        entrypoint = left
        args: list[str] = []
    else:
        bracket_start = left.find("[")
        bracket_end = left.rfind("]")
        if bracket_end == -1 or bracket_end < bracket_start:
            raise YalexSyntaxError("Cabecera de rule invalida: argumentos mal formados.")
        entrypoint = left[:bracket_start].strip()
        args_text = left[bracket_start + 1 : bracket_end].strip()
        args = [arg.strip() for arg in args_text.split(",") if arg.strip()] if args_text else []
        if left[bracket_end + 1 :].strip():
            raise YalexSyntaxError("Cabecera de rule invalida: texto extra despues de argumentos.")

    if not entrypoint or not (entrypoint[0].isalpha() or entrypoint[0] == "_"):
        raise YalexSyntaxError("Cabecera de rule invalida: nombre de entrypoint.")
    if any(not (c.isalnum() or c == "_") for c in entrypoint):
        raise YalexSyntaxError("Cabecera de rule invalida: nombre de entrypoint.")
    return entrypoint, args

def _split_pattern_action(segment: str) -> tuple[str, str]:
    segment = segment.strip()
    if not segment:
        raise YalexSyntaxError("Regla vacia en bloque rule.")
    brace_index = -1
    paren_depth = 0
    bracket_depth = 0
    in_single_quote = False
    in_double_quote = False
    escape_next = False
    for idx, char in enumerate(segment):
        if escape_next:
            escape_next = False
            continue
        if (in_single_quote or in_double_quote) and char == "\\":
            escape_next = True
            continue
        if char == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
            continue
        if char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
            continue
        if in_single_quote or in_double_quote:
            continue
        if char == "(":
            paren_depth += 1
            continue
        if char == ")":
            paren_depth = max(0, paren_depth - 1)
            continue
        if char == "[":
            bracket_depth += 1
            continue
        if char == "]":
            bracket_depth = max(0, bracket_depth - 1)
            continue
        if char == "{" and paren_depth == 0 and bracket_depth == 0:
            brace_index = idx
            break
    if brace_index == -1:
        raise YalexSyntaxError(f"Regla sin accion: {segment!r}")
    pattern = segment[:brace_index].strip()
    action, end_pos = _extract_brace_block(segment, brace_index)
    trailing = segment[end_pos:].strip()
    if trailing:
        raise YalexSyntaxError(f"Texto inesperado despues de accion: {trailing!r}")
    return pattern, action.strip()

def _parse_rules(rule_text: str) -> list[YalexRule]:
    # split on top-level pipes, preserving inner pipes inside [] or () and braces
    segments: list[str] = []
    current: list[str] = []
    paren_depth = 0
    bracket_depth = 0
    brace_depth = 0
    in_single_quote = False
    in_double_quote = False
    escape_next = False
    for char in rule_text:
        if escape_next:
            current.append(char)
            escape_next = False
            continue
        if (in_single_quote or in_double_quote) and char == "\\":
            current.append(char)
            escape_next = True
            continue
        if char == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
            current.append(char)
            continue
        if char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
            current.append(char)
            continue
        if in_single_quote or in_double_quote:
            current.append(char)
            continue

        if char == "(":
            paren_depth += 1
        elif char == ")":
            paren_depth = max(0, paren_depth - 1)
        elif char == "[":
            bracket_depth += 1
        elif char == "]":
            bracket_depth = max(0, bracket_depth - 1)
        elif char == "{":
            brace_depth += 1
        elif char == "}":
            brace_depth = max(0, brace_depth - 1)

        if char == "|" and paren_depth == 0 and bracket_depth == 0 and brace_depth == 0:
            segment = "".join(current).strip()
            if segment:
                segments.append(segment)
            current = []
            continue
        current.append(char)
    tail = "".join(current).strip()
    if tail:
        segments.append(tail)

    rules: list[YalexRule] = []
    for index, segment in enumerate(segments):
        pattern, action = _split_pattern_action(segment)
        rules.append(YalexRule(pattern=pattern, action=action, index=index))
    if not rules:
        raise YalexSyntaxError("No se encontraron reglas dentro de rule.")
    return rules

def parse_yalex(text: str) -> YalexSpec:
    cleaned = _strip_comments(text)
    lines = cleaned.splitlines()
    header, lines_wo_header = _consume_optional_header(lines, cleaned)
    lets, cursor = _parse_lets(lines_wo_header)

    while cursor < len(lines_wo_header) and not lines_wo_header[cursor].strip():
        cursor += 1
    if cursor >= len(lines_wo_header):
        raise YalexSyntaxError("No se encontro una seccion rule.")

    entrypoint, args = _parse_rule_header(lines_wo_header[cursor])

    remainder = "\n".join(lines_wo_header[cursor + 1:]).strip()
    if not remainder:
        raise YalexSyntaxError("La seccion rule no contiene reglas.")

    # optional trailer: if text ends with a top-level { ... } after rule rules.
    trailer = ""
    rule_body = remainder
    if remainder.endswith("}"):
        # try to identify last top-level block as trailer
        for i in range(len(remainder) - 1, -1, -1):
            if remainder[i] == "{":
                try:
                    candidate, end_pos = _extract_brace_block(remainder, i)
                except YalexSyntaxError:
                    continue
                if end_pos == len(remainder):
                    prefix = remainder[:i].rstrip()
                    if prefix and prefix[-1] == "}":
                        trailer = candidate
                        rule_body = prefix
                    break

    rules = _parse_rules(rule_body)
    return YalexSpec(header=header, trailer=trailer, lets=lets, entrypoint=entrypoint, args=args, rules=rules)
