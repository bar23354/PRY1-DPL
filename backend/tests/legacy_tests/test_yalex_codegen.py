from pathlib import Path
import importlib.util

from generador_lexico.yalex.codegen import write_lexer_file
from generador_lexico.yalex.compiler import compile_yalex
from generador_lexico.yalex.parser import parse_yalex


def test_codegen_genera_archivo_python(tmp_path: Path):
    source = """
rule tokens =
  "if" { return IF }
| [' ''\\t''\\n']+ {}
| ['a'-'z']+ { return ID }
"""
    compiled = compile_yalex(parse_yalex(source))
    out = write_lexer_file(compiled, tmp_path / "thelexer")
    content = out.read_text(encoding="utf-8")
    assert out.name == "thelexer.py"
    assert "def tokens(text, *args, **kwargs):" in content
    assert "_RULES = [" in content
    assert "generador_lexico.yalex.runtime" not in content

    spec = importlib.util.spec_from_file_location("thelexer", out)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None and spec.loader is not None
    spec.loader.exec_module(module)

    tokens = module.tokens("if abc")
    assert [(token.type, token.lexeme) for token in tokens] == [("IF", "if"), ("ID", "abc")]


def test_codegen_preserva_header_y_trailer(tmp_path: Path):
    source = """
{
HELPER = "ok"
}
rule tokens =
  "if" { return IF }
| eof { return EOF }
{
FINAL_FLAG = True
}
"""
    compiled = compile_yalex(parse_yalex(source))
    out = write_lexer_file(compiled, tmp_path / "lexer_con_bloques")
    content = out.read_text(encoding="utf-8")

    assert 'HELPER = "ok"' in content
    assert "FINAL_FLAG = True" in content

    spec = importlib.util.spec_from_file_location("lexer_con_bloques", out)
    module = importlib.util.module_from_spec(spec)
    assert spec is not None and spec.loader is not None
    spec.loader.exec_module(module)

    tokens = module.tokens("if")
    assert [token.type for token in tokens] == ["IF", "EOF"]
    assert module.HELPER == "ok"
    assert module.FINAL_FLAG is True
