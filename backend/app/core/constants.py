"""Taxonomia espiritual, tipos de conteúdo e textos de compliance do AuraSync."""

SPIRITUAL_AXES = {
    "earth": {"label": "Terra", "meaning": "estabilidade, corpo, presença"},
    "water": {"label": "Água", "meaning": "emoção, fluidez, aceitação"},
    "fire": {"label": "Fogo", "meaning": "energia, coragem, transformação"},
    "air": {"label": "Ar", "meaning": "clareza, leveza, respiração"},
    "ether": {"label": "Éter", "meaning": "silêncio, expansão, contemplação"},
    "light": {"label": "Luz", "meaning": "propósito, gratidão, elevação"},
    "night": {"label": "Noite", "meaning": "descanso, entrega, sono"},
    "root": {"label": "Raiz", "meaning": "segurança, aterramento"},
    "heart": {"label": "Coração", "meaning": "compaixão, amor, abertura"},
    "sky": {"label": "Céu", "meaning": "amplitude, visão, transcendência"},
}

# 'journey' NÃO é um tipo de content_item: jornadas são agregados próprios
# (spiritual_journeys + journey_steps) que referenciam content_items.
CONTENT_TYPES = ("music", "meditation", "soundscape", "binaural", "breathing")

MOOD_TAGS = (
    "calm", "contemplative", "deep", "warm", "vast", "gentle",
    "focused", "sacred", "dark", "luminous", "airy", "grounded",
)

GOALS = ("relaxation", "sleep", "meditation", "focus", "spiritual", "breathing", "silence")

EXPERIENCE_LEVELS = ("beginner", "intermediate", "advanced")

# Recomendação v1 por regras: eixos priorizados por período do dia.
TIME_OF_DAY_AXES = {
    "morning": ["light", "air", "heart", "sky"],     # 05h–11h
    "afternoon": ["air", "fire", "earth", "light"],  # 12h–17h
    "evening": ["water", "ether", "heart", "night"], # 18h–21h
    "night": ["night", "water", "earth", "root"],    # 22h–04h
}

GOAL_AXES = {
    "relaxation": ["water", "earth", "ether"],
    "sleep": ["night", "water", "root"],
    "meditation": ["ether", "sky", "heart"],
    "focus": ["air", "fire", "earth"],
    "spiritual": ["light", "ether", "sky"],
    "breathing": ["air", "heart"],
    "silence": ["ether", "night"],
}

GOAL_MOODS = {
    "relaxation": ["calm", "gentle", "warm"],
    "sleep": ["calm", "dark", "deep"],
    "meditation": ["contemplative", "sacred", "deep"],
    "focus": ["focused", "airy", "grounded"],
    "spiritual": ["sacred", "luminous", "vast"],
    "breathing": ["airy", "gentle", "calm"],
    "silence": ["deep", "contemplative", "dark"],
}

DISCLAIMER_TEXT = (
    "O AuraSync é um aplicativo de bem-estar voltado a relaxamento, foco, sono, "
    "respiração e contemplação. Não é um dispositivo médico, não diagnostica, "
    "não trata e não cura nenhuma condição de saúde, e não substitui "
    "acompanhamento médico ou psicológico profissional."
)

BINAURAL_SAFETY_TEXT = (
    "Use fones de ouvido estéreo para a experiência binaural. Mantenha o volume "
    "em nível confortável. Não utilize durante direção de veículos ou operação "
    "de máquinas. Em caso de desconforto, interrompa o uso."
)


def time_of_day(hour: int) -> str:
    if 5 <= hour <= 11:
        return "morning"
    if 12 <= hour <= 17:
        return "afternoon"
    if 18 <= hour <= 21:
        return "evening"
    return "night"
