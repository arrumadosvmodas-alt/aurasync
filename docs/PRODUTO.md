# AuraSync — Conceito de Produto

## Proposta

Aplicativo de relaxamento, contemplação espiritual e expansão interior baseado em
músicas, sons naturais, meditações guiadas, imagens simbólicas, jornadas
espirituais e sessões binaurais.

**Comunicação permitida**: apoia relaxamento · favorece foco · ajuda na rotina
meditativa · cria ambiente sonoro contemplativo.

**Comunicação proibida**: "cura ansiedade", "cura depressão", "cura insônia",
"altera consciência garantidamente" ou qualquer promessa médica/terapêutica.

## Navegação (app)

5 abas: **Início · Explorar · Meditar · Jornadas · Perfil**

- **Início** — sessão recomendada para agora, continuar de onde parou, jornada do
  dia, imagem contemplativa do dia, respiração rápida, favoritos.
- **Explorar** — seções: Músicas, Natureza (soundscapes), Binaural, Imagens.
- **Meditar** — categorias: iniciantes, respiração consciente, relaxamento
  corporal, sono profundo, gratidão, silêncio interior, observação dos
  pensamentos, abertura espiritual, meditação com imagem, sem narração.
- **Jornadas** — programas de 7 dias por eixo espiritual.
- **Perfil** — preferências do onboarding, histórico, progresso.

## Taxonomia espiritual (eixos)

| Eixo | Slug | Significado |
|---|---|---|
| Terra | `earth` | estabilidade, corpo, presença |
| Água | `water` | emoção, fluidez, aceitação |
| Fogo | `fire` | energia, coragem, transformação |
| Ar | `air` | clareza, leveza, respiração |
| Éter | `ether` | silêncio, expansão, contemplação |
| Luz | `light` | propósito, gratidão, elevação |
| Noite | `night` | descanso, entrega, sono |
| Raiz | `root` | segurança, aterramento |
| Coração | `heart` | compaixão, amor, abertura |
| Céu | `sky` | amplitude, visão, transcendência |

A taxonomia conecta áudio, imagem e meditação. Exemplos:

- chuva + lago + meditação de aceitação = **Água**
- fogueira + vela + prática de coragem = **Fogo**
- vento + céu aberto + respiração = **Ar**
- drone profundo + montanha + grounding = **Terra**
- silêncio + cosmos + contemplação = **Éter**

## Jornadas espirituais

Cada jornada tem: tema espiritual, objetivo emocional, música, som ambiente,
imagem principal, meditação guiada, prática de respiração, frase contemplativa,
duração e nível. Formato padrão: 7 dias (ex.: Jornada da Água — Permitir, Soltar,
Abrandar, Confiar, Silenciar, Renovar, Integrar).

## Categoria Binaural (nunca "Hemi-Sync")

"Hemi-Sync®" é marca registrada (Monroe Institute/Monroe Products) e **não pode**
ser usada. Nomes de categoria próprios: Áudios Binaurais, Frequências de Foco,
Ondas Meditativas, Escuta Profunda, Soundscapes Binaurais.

Tipos técnicos: binaural beat, isochronic tone, drone estéreo, ruído rosa, ruído
marrom, camadas naturais, pads ambientais. Frequências são tratadas como
**experiência sonora**, nunca como promessa médica.

## Motor de correlação áudio × imagem (score)

```
score = eixo_espiritual_match * 35
      + mood_match            * 25
      + cor_match             * 10
      + horario_match         * 10
      + objetivo_usuario_match* 10
      + popularidade          * 5
      + novidade              * 5
```

Recomendação v1 por regras de horário:

- **Manhã**: luz, ar, gratidão, energia suave
- **Tarde**: foco, clareza, respiração, piano leve
- **Noite**: água, terra, sono, chuva, ruído marrom

## Metas de biblioteca

| Fase | Músicas | Sons | Imagens | Meditações | Binaurais | Jornadas |
|---|---|---|---|---|---|---|
| MVP | 50 | 100 | 300 | 20 | 10 | 5 |
| 1.0 | 300 | 500 | 3.000 | 100 | 50 | 30 |
| Escala | 1.000+ | 2.000+ | 20.000+ | 500+ | 100+ | — |

## Monetização (fase futura)

Freemium: gratuito (meditações básicas, sons limitados, 1 jornada, timer) vs.
premium (catálogo completo, downloads offline, jornadas completas, binaurais,
modo imersivo, conteúdo semanal). O campo `is_premium` já existe no modelo de
dados desde o MVP.
