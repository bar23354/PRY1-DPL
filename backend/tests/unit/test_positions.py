import pytest

from laboratorio.application.positions import build_line_starts, offset_to_line_column


def test_build_line_starts_detecta_inicio_de_lineas():
    assert build_line_starts("ab\ncd\nef") == [0, 3, 6]


def test_offset_to_line_column_mapea_offsets_a_linea_y_columna():
    text = "ab\ncd\nef"
    assert offset_to_line_column(text, 0) == (1, 1)
    assert offset_to_line_column(text, 2) == (1, 3)
    assert offset_to_line_column(text, 3) == (2, 1)
    assert offset_to_line_column(text, len(text)) == (3, 3)


@pytest.mark.parametrize("offset", [-1, 100])
def test_offset_to_line_column_valida_rango(offset):
    with pytest.raises(ValueError):
        offset_to_line_column("abc", offset)

