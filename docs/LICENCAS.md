# AuraSync — Política de Licenças e Curadoria

## Ordem de preferência

1. **Domínio público real**
2. **CC0** ("no rights reserved")
3. **CC BY** (com atribuição registrada e exibida)
4. **Licenças royalty-free permissivas** (Pixabay, Unsplash, Pexels — ver restrições)
5. **Conteúdo próprio** gerado/produzido (ex.: sessões binaurais sintetizadas)

## Regra de ouro

> **Nenhum asset é publicado sem registro em `asset_licenses`**: fonte, URL da
> fonte, autor, nome da licença, URL da licença, exigência de atribuição, texto
> de atribuição, permissão de uso comercial e de obra derivada, e data de
> verificação. O backend bloqueia a publicação de conteúdo cujo asset não tenha
> licença registrada.


## Pacote local atual

O pacote local atual usa conteudo proprio do **AuraSync Procedural Media Kit**, registrado como **CC0 1.0 Universal** em `asset_licenses`. O manifesto tecnico fica em [MEDIA_MANIFEST.md](MEDIA_MANIFEST.md).

Antes de publicar ou trocar assets, rode:

```powershell
python scripts\audit_media.py
python -m pytest backend\tests
```

## Fontes recomendadas

### Música
- **Musopen** — gravações/partituras de domínio público e royalty-free
- **Wikimedia Commons** — verificar licença na página de cada arquivo
- **Citizen DJ / Library of Congress** — sons públicos/free-to-use
- **Openverse** — buscador de mídia com licenças abertas
- **IMSLP** — com cuidado adicional (gravação ≠ partitura; verificar ambas)

### Sons naturais
- **Freesound** — Creative Commons (verificar variante: CC0, BY, BY-NC)
- **Pixabay Sound Effects** — royalty-free, geralmente sem atribuição
- **Citizen DJ**, **Wikimedia Commons**, **Openverse**

### Imagens
- **Wikimedia Commons**, **Openverse**, **Pixabay**, **Pexels**, **Unsplash**

## Restrições importantes

- **Unsplash/Pexels/Pixabay não são domínio público** — têm licenças próprias
  permissivas, mas **proíbem** compilar o acervo para criar serviço concorrente
  de stock. Estratégia segura: usar assets como **experiência integrada ao
  áudio**, nunca replicar banco de imagens como produto.
- **CC BY-NC** (não comercial) é **incompatível** com app pago/freemium — não usar.
- **CC BY-SA** exige compartilhar derivados sob a mesma licença — evitar para
  áudio mixado.
- Gravações de música clássica: a **obra** pode ser domínio público, mas a
  **gravação** tem direitos próprios — verificar a licença da gravação.

## Critérios técnicos de curadoria

**Músicas**: baixo BPM, sem mudanças bruscas, sem percussão agressiva, boa
qualidade, loop possível, licença clara, sem letras conflitantes.

**Sons naturais**: sem ruídos humanos, sem cortes bruscos, volume estável, sem
picos agressivos, loop limpo, licença compatível.

**Imagens**: alta resolução, sem marcas/logos, sem pessoas identificáveis quando
possível, sem símbolos religiosos sensíveis fora de contexto, paleta coerente
com o áudio.

## Marcas de terceiros

Proibido usar **"Hemi-Sync®"** (Monroe Institute/Monroe Products) ou qualquer
marca registrada de terceiros em nomes de recursos, categorias, metadados,
código ou marketing. Categoria própria: "Áudios Binaurais".
