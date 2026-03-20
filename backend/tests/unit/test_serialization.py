from laboratorio.application.serialization import serialize_afd


def test_serialize_afd_normaliza_estructura_basica():
    afd = {
        "estados": ["S2", "S0", "S1"],
        "alfabeto": ["b", "a"],
        "transiciones": {"S1": {"b": "S2", "a": "S1"}, "S0": {"a": "S1"}},
        "estadoInicial": "S0",
        "estadosAceptacion": {"S2"},
        "conjuntos": {"S1": frozenset({2, 1}), "S0": frozenset({0})},
    }

    serialized = serialize_afd(afd)

    assert serialized["states"] == ["S0", "S1", "S2"]
    assert serialized["initialState"] == "S0"
    assert serialized["acceptingStates"] == ["S2"]
    assert serialized["transitions"]["S1"] == {"a": "S1", "b": "S2"}
    assert serialized["stateSets"]["S1"] == [1, 2]

