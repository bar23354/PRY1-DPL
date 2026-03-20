def _ordered_states(states) -> list[str]:
    def _key(state: str):
        try:
            return int(state[1:])
        except (ValueError, IndexError):
            return state

    return sorted(states, key=_key)


def serialize_afd(afd: dict) -> dict:
    return {
        "states": _ordered_states(afd.get("estados", [])),
        "alphabet": list(afd.get("alfabeto", [])),
        "transitions": {
            state: dict(sorted(transitions.items(), key=lambda item: item[0]))
            for state, transitions in sorted(afd.get("transiciones", {}).items(), key=lambda item: item[0])
        },
        "initialState": afd.get("estadoInicial"),
        "acceptingStates": _ordered_states(afd.get("estadosAceptacion", set())),
        "stateSets": {
            state: list(sorted(values))
            for state, values in sorted(afd.get("conjuntos", {}).items(), key=lambda item: item[0])
        },
    }

