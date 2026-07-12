---
name: Vibrant Professionalism
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#434656'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#006e2a'
  on-secondary: '#ffffff'
  secondary-container: '#5cfd80'
  on-secondary-container: '#00732c'
  tertiary: '#6c4600'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c5c00'
  on-tertiary-container: '#ffe0b9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#69ff87'
  secondary-fixed-dim: '#3ce36a'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#00531e'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#ffb950'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
---

## Marca e Estilo

Este sistema de design foi concebido para um aplicativo móvel versátil que equilibra a confiança institucional com uma energia vibrante e moderna. A personalidade da marca é **solícita, eficiente e contemporânea**, buscando evocar uma resposta emocional de segurança e agilidade no usuário.

O estilo visual adotado é o **Corporate Modern com toques de Tonal Layering**. Ele utiliza uma estética limpa, com foco em uma hierarquia visual clara, tipografia robusta e superfícies que parecem organizadas e leves. A interface evita o excesso de ornamentos em favor da clareza funcional, utilizando cores de destaque de forma estratégica para guiar o olhar e incentivar a ação. O resultado é uma experiência que parece profissional o suficiente para finanças ou produtividade, mas dinâmica o suficiente para redes sociais ou lifestyle.

## Cores

A paleta de cores é fundamentada em um **Azul Primário (Electric Blue)** que transmite confiabilidade e inovação tecnológica. As cores de destaque são vibrantes para garantir acessibilidade e contraste em ambientes móveis.

- **Primária (#0052FF):** Utilizada para a marca principal, botões de ação primária e estados ativos de navegação.
- **Secundária (#00C853):** Um verde vibrante destinado a ações de sucesso, confirmação e elementos de crescimento.
- **Terciária (#FFAB00):** Um âmbar energético para alertas, atenção ou recursos premium.
- **Neutras:** Uma escala de cinzas frios e suaves. O fundo principal utiliza `#F4F7F9` para reduzir o cansaço visual e destacar os cards brancos puros.
- **Semânticas:** Vermelho `#FF5252` para erros críticos e destrutivos.

## Tipografia

A estratégia tipográfica utiliza a **Plus Jakarta Sans** para cabeçalhos para conferir uma personalidade moderna e levemente amigável devido às suas formas abertas. Para o corpo de texto e interface funcional, utilizamos a **Inter**, uma fonte altamente legível em telas pequenas com excelente renderização de glifos.

As escalas foram otimizadas para o contexto móvel:
- **Títulos:** Usam pesos *Bold* ou *SemiBold* com espaçamento entre letras levemente reduzido para criar impacto visual.
- **Corpo de Texto:** Prioriza a legibilidade com entrelinhas (line-height) generosas para facilitar a leitura rápida.
- **Labels:** São compactas e utilizam peso *SemiBold* para diferenciar claramente metadados de textos de leitura.

## Layout e Espaçamento

O sistema utiliza um modelo de **Grade Fluida baseada em 4px**, garantindo que todos os elementos sejam proporcionais entre si. 

- **Estrutura Móvel:** Grade de 4 colunas com margens laterais de `20px` e canaletas (gutters) de `16px`.
- **Ritmo Vertical:** Os componentes devem ser espaçados em múltiplos de `8px` para criar uma cadência visual consistente.
- **Toque (Touch Targets):** Todos os elementos interativos devem ter uma área de toque mínima de `44x44px` para conformidade com normas de acessibilidade.

## Elevação e Profundidade

A hierarquia é construída através de **Camadas Tonais e Sombras Ambiente Sutis**. O design evita sombras pesadas em favor de uma profundidade natural que imita a luz vinda de cima.

- **Nível 0 (Fundo):** Superfície base em cinza extra claro.
- **Nível 1 (Cards e Listas):** Superfície branca com uma sombra muito suave (Blur: 8px, Y: 2px, Opacidade: 4% de preto).
- **Nível 2 (Modais e Menus Flutuantes):** Superfície branca com sombra distinta (Blur: 16px, Y: 8px, Opacidade: 8% de preto) para indicar sobreposição clara.
- **Bordas:** Em vez de sombras fortes, utilizamos bordas de `1px` em tons de cinza muito claros (`#E2E8F0`) para definir limites de objetos em estados de baixa elevação.

## Formas

A linguagem de formas é **Arredondada e Suave**, comunicando modernidade e acessibilidade. 

- **Componentes Padrão:** Botões, inputs e pequenos cards utilizam o raio de `8px` (0.5rem).
- **Contêineres Grandes:** Cards de destaque e seções principais utilizam `16px` (1rem).
- **Elementos de Interface:** Tags e badges utilizam o estilo "Pill" (totalmente arredondado) para se destacarem de elementos retangulares.

## Componentes

### Botões
- **Primário:** Fundo azul, texto branco. Estado *Hover* escurece 10%, estado *Ativo* (pressionado) reduz a escala para 98%.
- **Secundário:** Fundo azul claro (10% de opacidade) com texto azul.
- **Terciário (Ghost):** Sem fundo, apenas texto.

### Cards
Os cards são brancos com bordas arredondadas de `16px`. Devem conter um preenchimento interno (padding) de `16px` ou `20px`. A sombra deve ser aplicada apenas no estado de repouso para dar flutuabilidade.

### Inputs de Formulário
- **Estado Padrão:** Borda cinza clara, fundo branco.
- **Estado de Foco:** Borda azul primária com um anel de foco externo de `2px` com 20% de opacidade.
- **Rótulos (Labels):** Sempre visíveis acima do campo em `body-md` Bold.

### Navegação
- **Barra Inferior (Tab Bar):** Fundo branco com desfoque de fundo (backdrop filter). Ícones ativos usam a cor primária, ícones inativos usam cinza médio.
- **Indicador de Seleção:** Um pequeno ponto ou linha suave abaixo do ícone ativo para reforçar o estado.

### Chips e Badges
Utilizados para categorias ou status. Devem ser compactos, com fontes `label-md` e cores de fundo pastéis (versões de 15% de opacidade das cores principais).