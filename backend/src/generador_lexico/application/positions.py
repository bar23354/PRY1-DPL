from bisect import bisect_right


def build_line_starts(text: str) -> list[int]:
    starts = [0]
    for index, char in enumerate(text):
        if char == "\n":
            starts.append(index + 1)
    return starts


def offset_to_line_column(text: str, offset: int) -> tuple[int, int]:
    if offset < 0 or offset > len(text):
        raise ValueError("Offset fuera del rango del texto.")

    starts = build_line_starts(text)
    line_index = bisect_right(starts, offset) - 1
    line_start = starts[line_index]
    return line_index + 1, (offset - line_start) + 1

