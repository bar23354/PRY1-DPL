from dataclasses import dataclass

from laboratorio.analizador import prepararExpresion
from laboratorio.arbol import construirArbolDirecto
from laboratorio.construccion_afd import construirAfd
from laboratorio.minimizacion import minimizarAfd
from laboratorio.yalex_parser import YalexRule, YalexSpec
from laboratorio.yalex_regex import RegexExpr, default_universe, normalize_regex

@dataclass(frozen=True)
class CompiledRule:
    index: int
    source_pattern: str
    normalized_pattern: str
    action: str
    token_name: str
    skip: bool
    afd: dict
    is_eof: bool

@dataclass(frozen=True)
class CompiledLexer:
    entrypoint: str
    args: list[str]
    header: str
    trailer: str
    rules: list[CompiledRule]
    universe: list[str]

def _resolve_action(rule: YalexRule) -> tuple[str, bool]:
    action = rule.action.strip()
    if action == "":
        return "SKIP", True
    if action == "skip":
        return "SKIP", True
    if action.startswith("return "):
        tail = action[7:].strip()
        token = ""
        for ch in tail:
            if ch.isalnum() or ch == "_":
                token += ch
            else:
                break
        if token and (token[0].isalpha() or token[0] == "_"):
            return token, False
    return f"RULE_{rule.index}", False

def _build_afd(regex_text: str) -> dict:
    postfijo, alfa, _ = prepararExpresion(regex_text)
    raiz, hojas = construirArbolDirecto(postfijo)
    afd = construirAfd(raiz, hojas, alfa)
    return minimizarAfd(afd)

def compile_yalex(spec: YalexSpec) -> CompiledLexer:
    universe = sorted(default_universe())
    compiled_rules: list[CompiledRule] = []
    for rule in spec.rules:
        normalized: RegexExpr = normalize_regex(rule.pattern, spec.lets, universe=set(universe))
        token_name, skip = _resolve_action(rule)
        afd = _build_afd(normalized.regex) if not normalized.is_eof else {}
        compiled_rules.append(
            CompiledRule(
                index=rule.index,
                source_pattern=rule.pattern,
                normalized_pattern=normalized.regex if not normalized.is_eof else "eof",
                action=rule.action,
                token_name=token_name,
                skip=skip,
                afd=afd,
                is_eof=normalized.is_eof,
            )
        )
    return CompiledLexer(
        entrypoint=spec.entrypoint,
        args=spec.args,
        header=spec.header,
        trailer=spec.trailer,
        rules=compiled_rules,
        universe=universe,
    )