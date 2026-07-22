# Manifesto de Midia AuraSync

Este manifesto cobre os assets locais usados pelo catalogo publico do AuraSync.

## Licenca

Todos os audios e imagens gerados neste pacote foram produzidos localmente para o AuraSync e dedicados a **CC0 1.0 Universal**.

- Fonte: AuraSync Procedural Media Kit
- Autor: AuraSync
- Licenca: CC0 1.0 Universal
- URL da licenca: https://creativecommons.org/publicdomain/zero/1.0/
- Atribuicao: nao obrigatoria
- Uso comercial: permitido
- Obras derivadas: permitidas

## Audios

Os arquivos finais ficam em `storage/audio`. O formato publicado e WAV PCM, estereo, 44.1 kHz.

- Binaurais: gerados por `scripts/generate_binaural.py`.
- Musicas e soundscapes provis?rios: gerados por `scripts/generate_all_audios.py`.
- Meditacoes guiadas: texto proprio, voz local pt-BR `Microsoft Maria Desktop`, geradas por `scripts/generate_guided_meditations.ps1` e normalizadas por `scripts/normalize_guided_meditations.py`.

As meditacoes guiadas atuais sao narracoes curtas de 60 segundos. Elas substituem os tons instrumentais anteriores que estavam rotulados como meditacao guiada.

## Imagens

As capas ficam em `storage/images`. Sao SVGs proprios de 1200x800 gerados pelo seed, sem dependencia de Unsplash, Pexels, Pixabay ou outro acervo externo.

## Validacao

Antes de deploy, rode:

```powershell
python scripts\audit_media.py
python -m pytest backend\tests
```

A auditoria bloqueia: arquivo ausente, audio com extensao/formato divergente, WAV invalido, duracao divergente, URL externa/CDN em asset local e asset sem licenca registrada.
