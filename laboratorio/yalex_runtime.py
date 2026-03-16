from dataclasses import dataclass
import textwrap

from laboratorio.yalex_compiler import CompiledLexer, CompiledRule


@dataclass(frozen=True)
class LexToken:
    type: str
    lexeme: str
    start: int
    end: int
    rule_index: int


class YalexLexError(ValueError):
    pass


SKIP = object()


def _build_action_callable(action: str, globals_ctx: dict):
    raw_lines = action.splitlines()
    if raw_lines:
        first_indent = len(raw_lines[0]) - len(raw_lines[0].lstrip(" "))
        tail_indents = [
            len(line) - len(line.lstrip(" "))
            for line in raw_lines[1:]
            if line.strip()
        ]
        if first_indent == 0 and tail_indents:
            min_tail = min(tail_indents)
            if min_tail > 0:
                raw_lines[0] = (" " * min_tail) + raw_lines[0]
    body = textwrap.dedent("\n".join(raw_lines)).strip("\n")
    if body.strip() == "":
        def _skip_action(*_args, **_kwargs):
            return SKIP
        return _skip_action

    processed_lines: list[str] = []
    for line in body.splitlines():
        if line.strip() == "skip":
            processed_lines.append("return SKIP")
        else:
            processed_lines.append(line)
    fn_src = "def __yal_action(lexeme, lexbuf, args):\n"
    if not processed_lines:
        fn_src += "    return SKIP\n"
    else:
        for line in processed_lines:
            fn_src += f"    {line}\n"
        if all(not line.strip().startswith("return ") for line in processed_lines if line.strip()):
            fn_src += "    return SKIP\n"
    scope: dict[str, object] = dict(globals_ctx)
    scope["SKIP"] = SKIP
    exec(fn_src, scope, scope)
    return scope["__yal_action"]


def _execute_action(rule: CompiledRule, lexeme: str, args: tuple, globals_ctx: dict):
    action_fn = _build_action_callable(rule.action, globals_ctx)
    lexbuf = {"lexeme": lexeme}
    return action_fn(lexeme, lexbuf, args)


def _max_prefix_match(rule: CompiledRule, text: str, start: int) -> int:
    afd = rule.afd
    trans = afd["transiciones"]
    accept = afd["estadosAceptacion"]
    state = afd["estadoInicial"]
    best_end = start if state in accept else -1
    pos = start

    while pos < len(text):
        char = text[pos]
        next_state = trans.get(state, {}).get(char)
        if next_state is None:
            break
        pos += 1
        state = next_state
        if state in accept:
            best_end = pos

    if best_end == -1:
        return -1
    return best_end - start


def scan(compiled: CompiledLexer, text: str, *entry_args, globals_ctx: dict | None = None) -> list[LexToken]:
    tokens: list[LexToken] = []
    pos = 0
    gctx = {} if globals_ctx is None else dict(globals_ctx)
    normal_rules = [rule for rule in compiled.rules if not rule.is_eof]
    eof_rules = [rule for rule in compiled.rules if rule.is_eof]
    # allow `return TOKEN_NAME` without quotes in actions
    for rule in compiled.rules:
        if rule.token_name and rule.token_name not in gctx:
            gctx[rule.token_name] = rule.token_name
    # bind entrypoint args (rule main [arg1, arg2])
    for index, arg_name in enumerate(compiled.args):
        if index < len(entry_args):
            gctx[arg_name] = entry_args[index]

    while pos < len(text):
        best_rule: CompiledRule | None = None
        best_len = -1

        for rule in normal_rules:
            match_len = _max_prefix_match(rule, text, pos)
            if match_len > best_len:
                best_len = match_len
                best_rule = rule
            elif match_len == best_len and match_len > -1 and best_rule is not None and rule.index < best_rule.index:
                best_rule = rule

        if best_rule is None or best_len < 0:
            preview = text[pos : pos + 20]
            raise YalexLexError(f"No se pudo tokenizar desde la posicion {pos}: {preview!r}")
        if best_len == 0:
            raise YalexLexError(
                f"La regla {best_rule.index} acepta cadena vacia; esto causa ciclo infinito en lexer."
            )

        lexeme = text[pos : pos + best_len]
        action_result = _execute_action(best_rule, lexeme, entry_args, gctx)
        if action_result is SKIP or best_rule.skip:
            pos += best_len
            continue
        if isinstance(action_result, str):
            tokens.append(
                LexToken(
                    type=action_result,
                    lexeme=lexeme,
                    start=pos,
                    end=pos + best_len,
                    rule_index=best_rule.index,
                )
            )
        else:
            tokens.append(
                LexToken(
                    type=best_rule.token_name,
                    lexeme=lexeme,
                    start=pos,
                    end=pos + best_len,
                    rule_index=best_rule.index,
                )
            )
        pos += best_len

    if eof_rules:
        eof_rule = min(eof_rules, key=lambda rule: rule.index)
        eof_result = _execute_action(eof_rule, "", entry_args, gctx)
        if eof_result is not SKIP:
            token_type = eof_result if isinstance(eof_result, str) else eof_rule.token_name
            tokens.append(LexToken(type=token_type, lexeme="", start=len(text), end=len(text), rule_index=eof_rule.index))

    return tokens
