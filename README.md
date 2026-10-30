# MS Saga: A New Dawn (`SLUS_212.70`) — Companion App & Reverse Engineering Toolkit

[![Target Game](https://img.shields.io/badge/Game-MS%20Saga%3A%20A%20New%20Dawn%20(USA)-blue?style=for-the-badge&logo=playstation)](https://en.wikipedia.org/wiki/MS_Saga:_A_New_Dawn)
[![Target Platform](https://img.shields.io/badge/Platform-PlayStation%202%20(NTSC--U)-003791?style=for-the-badge&logo=playstation2)](https://pcsx2.net/)
[![PCSX2 CRC](https://img.shields.io/badge/Game%20CRC-9F18CBC5-orange?style=for-the-badge)](https://pcsx2.net/)
[![Frontend](https://img.shields.io/badge/Frontend-Electron%20%7C%20React%2018%20%7C%20TailwindCSS-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend & Tools](https://img.shields.io/badge/Toolkit-Python%203%20%7C%20Ghidra%2012-yellow?style=for-the-badge&logo=python)](https://python.org/)

Repositório unificado com o **Companion App tático**, o **conjunto de ferramentas de engenharia reversa** e o **patch corretivo PNACH (60 FPS + Anti-Crash)** para o clássico RPG de mechas **MS Saga: A New Dawn** (*Shin Seikiden Gundam R*, PS2 — `SLUS_212.70`).

O projeto reúne anos de análise de baixo nível da arquitetura MIPS R5900 da engine da BEC/Bandai, descompressão de arquivos originais da ISO, documentação de memória e um aplicativo desktop moderno sincronizado em tempo real com o emulador **PCSX2** via protocolo **PINE IPC**.

---

## 📑 Sumário

- [Visão Geral do Repositório](#-visão-geral-do-repositório)
- [1. Companion App Tático (`companion/`)](#1-companion-app-tático-companion)
  - [Funcionalidades Principais](#funcionalidades-principais)
  - [Arquitetura e Telemetria PINE](#arquitetura-e-telemetria-pine)
- [2. Suite de Engenharia Reversa (`extractor/` & Pesquisa)](#2-suite-de-engenharia-reversa-extractor--pesquisa)
  - [Arquitetura da Engine & Módulos `.rel`](#arquitetura-da-engine--módulos-rel)
  - [Scripts de Extração e Análise](#scripts-de-extração-e-análise)
- [3. Patch PNACH: 60 FPS & Correção de Travamentos (`9F18CBC5.pnach`)](#3-patch-pnach-60-fps--correção-de-travamentos-9f18cbc5pnach)
  - [Diagnóstico dos 6 Bugs Críticos da Engine](#diagnóstico-dos-6-bugs-críticos-da-engine)
- [4. Estrutura do Diretório](#4-estrutura-do-diretório)
- [5. Guia de Instalação e Uso](#5-guia-de-instalação-e-uso)
  - [Configurando o PCSX2](#configurando-o-pcsx2)
  - [Executando o Companion App](#executando-o-companion-app)
- [6. Mapa de Memória EE (PlayStation 2)](#6-mapa-de-memória-ee-playstation-2)
- [7. Licença e Créditos](#7-licença-e-créditos)

---

## 🧭 Visão Geral do Repositório

Diferente de companions comuns baseados apenas em dados estáticos de internet, este ecossistema foi construído a partir da **extração direta dos dados binários do jogo**:
1. **Engenharia Reversa:** Descompressão de arquivos dos archives `AFSLIST0.AFS` e `AFSLIST1.AFS`, descompilação dos executáveis no Ghidra e inspeção de structs de memória.
2. **Companion Desktop:** Interface tática de alta densidade informativa, com HUD estilo cockpit militar, mapa completo de baús e sincronização de dados via PINE.
3. **Estabilidade no Emulador:** Solução definitiva para os congelamentos históricos do jogo no PCSX2 quando jogado em 60 FPS ou com Turbo / Fast-Forward ativado.

---

## 1. Companion App Tático (`companion/`)

Aplicativo desktop desenvolvido com **Electron**, **React 18**, **TypeScript**, **TailwindCSS** e **Vite**, projetado para rodar lado a lado com o PCSX2.

```
┌────────────────────────────────────────────────────────────────────────┐
│  MS SAGA COMPANION  [PINE: LIVE 28011] [CRT: ON] [SFX: ON]            │
├─────────────────┬───────────────────┬────────────────┬─────────────────┤
│ DETONADO & BAÚS │ BESTIÁRIO & DROPS │ ALERTAS MISS.  │ ENCICLOPÉDIA MS │
├─────────────────┴───────────────────┴────────────────┴─────────────────┤
│  Capítulo 0: O Despertar & O Ataque Misterioso                         │
│  [x] Passo 1: Ative o gerador central no G System 01                   │
│  [ ] Passo 2: Derrote o pelotão de Type 61 Tanks com Fritz e Tristan   │
│  BAÚS DA ÁREA: [ ] Restorative Drink x1  [ ] Regenerative Kit x1       │
├────────────────────────────────────────────────────────────────────────┤
│  ESQUADRÃO: Tristan (120/120 HP) | Fritz (116/116 HP) | CRÉDITOS: 204C │
└────────────────────────────────────────────────────────────────────────┘
```

### Funcionalidades Principais:

* **Detonado & Guia Canônico (15 Capítulos em 5 Atos):**
  - Roteiro linear baseado na progressão oficial (`SLUS_212.70`), do Prólogo em Marie's Place até a base orbital e o post-game (*Another G System* com 50 andares).
  - 71 objetivos estruturados passo a passo com instruções táticas concisas (`hints`), fraquezas de chefes e condições de recrutamento de pilotos.
* **Rastreador de Baús (180 Baús Canônicos):**
  - Mapeamento completo dos 180 baús do jogo com identificadores persistentes (`ch-mp-1` a `ch-pg-5`).
  - Filtros rápidos: *Todos*, *Pendentes*, *Trancados* (exigem Gazuza/Lockpick) e *Perdíveis*.
* **Bestiário Oficial & Drops (270 Inimigos):**
  - Dados extraídos diretamente das tabelas binárias do jogo (`sento_dll` e `glbdata`): HP, EN, EXP, Gold, fraquezas elementais (💥 Físico, ⚡ Beam, 🔥 Fogo, 🧪 Ácido, 🔊 Sônico), resistências e taxas de drop.
  - Localizações exatas de spawn (substituindo nomes genéricos por masmorras reais e setores do mapa-múndi).
  - Inimigos raros catalogados (ex: *#005 Prototype Zaku*, *#270 Black Assassin*).
* **Radar de Itens Perdíveis (*Missables*):**
  - Alertas antecipados para equipamentos e eventos com ponto sem retorno (ex: *Impact Lance*, os 8 baús permanentes de Fortress Eisengrad antes do elevador do trono, e lojas temporárias).
* **Enciclopédia de Pilotos, Mobile Suits e Armas:**
  - Árvore de evolução de Boosts e Habilidades por nível para todos os pilotos (Tristan, Fritz, Aeon, Tremmie, Gavane, Li Fang, Bazuli, Vargas, Rezner, Lapis, Hal).
  - Dimensões de grid de armas e escudos para otimização de inventário interno dos mechas.
* **Interface Tática & Efeitos Retrô:**
  - Shader CRT scanline opcional com efeito de fósforo verde/azul e aberração cromática.
  - Feedback sonoro sintetizado em tempo real via Web Audio API.

### Arquitetura e Telemetria PINE:
O backend Electron conecta-se via socket TCP local (`127.0.0.1:28011`) com a interface PINE (*PCSX2 IPC Protocol*), lendo a memória EE a cada 1000ms:
- **Detecção Determinística de Modo de Jogo:** Inspeciona a lista encadeada `g_DllListHead` (`0x003CAB60`) da engine, identificando com precisão absoluta se o jogador está no Mapa-Múndi (`bmap`), Dungeon (`fmap`), Cidade (`tmap`) ou Combate (`sento`).
- **Telemetria de Esquadrão e Economia:** Monitora em tempo real os créditos (Gold), HP, EN, status dos 6 slots da party e tempo de jogo decorrido.

---

## 2. Suite de Engenharia Reversa (`extractor/` & Pesquisa)

A pasta `extractor/` contém o ferramental em Python desenvolvido para analisar os formatos proprietários do jogo, extrair tabelas de texto e montar a base de dados do companion.

### Arquitetura da Engine & Módulos `.rel`
O jogo utiliza a **BEC Custom Engine** construída sobre **RenderWare 3.6** com **CRI Middleware** (ADX/Sofdec) e suporte a DLLs realocáveis via padrão **SN Systems ProDG (`SNR1`)**:
- A seção `.sndata` do executável principal (`SLUS_212.70`) preservou intactos **5.763 nomes originais de símbolos e funções** (`sn_dll_header_root`).
- O código de gameplay não roda todo no executável principal: ele é dividido em 12 módulos dinâmicos comprimidos armazenados no archive `AFSLIST0.AFS` (`[0000]` a `[0010]`), descompactados em tempo de execução para o buffer `dll_buf` (`0x00516A00`):

| ID | Arquivo AFS | Propósito |
| :---: | :--- | :--- |
| `0` | `title_dll.cmp` | Tela de Título e Boot |
| `1` | `staff_dll.cmp` | Créditos (*Staff Roll*) |
| `2` | `bmap_dll.cmp` | **World Map (`Big Map`)** — movimentação no mapa-múndi e encontros |
| `3` | `fmap_dll.cmp` | **Field / Dungeon Map** — movimentação em calabouços, baús e triggers |
| `4` | `sento_dll.cmp` | **Sistema de Batalha (`Sento`)** — turnos, cálculos de dano, IA e drops |
| `5` | `sub_dll.cmp` | Menu de Acampamento (*Camp Menu*) e Garagem de Mobile Suits |
| `6` | `tmap_dll.cmp` | **Town Map** — navegação em cidades, NPCs e lojas |
| `7` | `emov_dll.cmp` | Reprodutor de vídeos e cutscenes FMV |

### Scripts de Extração e Análise:

- **`inspect_afs.py` & `index_afs.py`:** Parser de baixo nível de arquivos CRI AFS. Varre cabeçalhos, índices de blocos e extrai os arquivos binários preservando metadados originais.
- **`read_ps_dec.py` & `disasm_ps_dec.py`:** Engenharia reversa e reimplementação da rotina de descompressão `PS_DecSucc` (`0x00106960`), algoritmo proprietário baseado em LZSS com bitstream adaptativo usado nos arquivos `.cmp`.
- **`build_bestiary.py` & `catalog_items.py`:** Varre os dados de combate das DLLs extraídas, localizando tabelas de status dos 270 inimigos, tabelas de armas e taxas de recompensa.
- **`build_comprehensive_walkthrough.py`:** Correlaciona IDs de baús, mapas de eventos e strings de diálogos para reconstruir o detonado canônico.
- **`pine_probe.py` & `test_live_pine.py`:** Utilitários de linha de comando para inspecionar, escanear padrões de memória e validar leituras do PCSX2 ao vivo.

---

## 3. Patch PNACH: 60 FPS & Correção de Travamentos (`9F18CBC5.pnach`)

Durante anos, *MS Saga: A New Dawn* foi considerado um dos jogos mais difíceis de rodar com Turbo ou patch de 60 FPS no PCSX2, frequentemente congelando em batalhas ou transições de mapa.

A auditoria completa no Ghidra do executável `SLUS_212.70` e dos 12 módulos `.rel` revelou a causa exata dos problemas e forneceu a solução implementada no arquivo `9F18CBC5.pnach`:

### Diagnóstico dos 6 Bugs Críticos da Engine:

1. **Spinloops Infinitos no Driver de Som do IOP (`SND_Main` — `0x00112BE8`):**  
   Ao rodar em Turbo/Fast-Forward, a fila de mensagens SPU2/IOP enchia e o código entrava num `while (ret < 0)` síncrono na thread principal do EE (`beq $zero, $zero, -5`). Isso travava o loop de frames do jogo enquanto a música continuava tocando.  
   *Correção:* Redirecionamento dos spinloops para o epílogo da função, liberando o frame para a próxima interrupção VBlank.
2. **Deadlock Síncrono no CRI ADX (`DISC_Main` / `ADXF_OpenAfs` — `0x0010B790`):**  
   Ao abrir arquivos AFS durante transições rápidas (Mapa ↔ Batalha), se o IOP ainda estivesse liberando um handle, o jogo executava um salto infinito sem rodar o despachante `ADXM_ExecMain()`.  
   *Correção:* Bypass seguro permitindo que o IOP processe a liberação e retente no próximo VBlank.
3. **Divisão por Zero via `SYS_GetVsyncVal` (`0x0010F168`):**  
   Em 60 FPS nativo (`vsync = 1`), funções nas DLLs dinâmicas causavam exceção MIPS `break 7` por tentar derivar taxas de frames por divisão.  
   *Correção:* Virtualização do retorno da função para fornecer a constante `2` esperada pelas DLLs.
4. **Concorrência de Carregamento Assíncrono (`Mod_CheckAutoGuard`):**  
   Evita que o Turbo avance ticks lógicos enquanto a engine está realocando DLLs na RAM ou carregando modelos 3D de batalha (`LDBN`/`LDBA`/`LDBE`).
5. **Ciclo de Vida das Primitivas 2D / Fonte (`FSF_Man` vs `B3D_Main`):**  
   Elimina o *flicker* de 30 Hz do texto e barras de HP quando o jogo opera em 60 FPS desacoplados.
6. **Dessincronia de PlayTime do Save:**  
   Garante que o relógio de horas/minutos do save progrida em tempo real real (1x), mesmo utilizando Fast-Forward ou 60 FPS.

---

## 4. Estrutura do Diretório

```
MSSAGA-PROJECT/
├── 9F18CBC5.pnach            # Patch oficial para PCSX2 (60 FPS + Anti-Freeze)
├── Abrir Companion.bat       # Launcher de 1 clique para Windows
├── MS Saga Companion.lnk     # Atalho para o executável
├── MSSAGA_REVERSE_STATE.md   # Documentação técnica completa da engenharia reversa
├── README.md                 # Esta documentação
│
├── companion/                # Projeto do Companion App (Electron / React)
│   ├── electron/             # Código principal do Electron e cliente PINE IPC
│   │   ├── main.ts           # Ciclo de vida, polling de memória e handlers IPC
│   │   └── preload.ts        # Ponte segura de contexto (ContextBridge)
│   ├── src/                  # Interface do Usuário (Frontend)
│   │   ├── components/       # HUD, Detonado, Bestiário, Missables, Pilotos, Navbar
│   │   ├── data/             # Bancos JSON extraídos (walkthrough, bestiary, etc.)
│   │   ├── types/            # Interfaces TypeScript
│   │   └── utils/            # Gerador de SFX retrô (Web Audio)
│   ├── release/win-unpacked/ # Build executável portátil para Windows
│   └── package.json
│
└── extractor/                # Ferramental de Engenharia Reversa em Python
    ├── inspect_afs.py        # Leitor e extrator de arquivos AFS
    ├── read_ps_dec.py        # Descompressor LZSS/bitstream das DLLs (.cmp)
    ├── build_bestiary.py     # Compilador dos dados de 270 inimigos
    ├── build_dataset.py      # Extrator de itens, armas e status
    ├── pine_probe.py         # Testador do protocolo PINE via socket
    └── data/                 # JSONs brutos gerados pelas ferramentas
```

---

## 5. Guia de Instalação e Uso

### Configurando o PCSX2:

1. **Ativar o protocolo PINE:**
   - Abra o PCSX2: `Configurações` ➔ `Geral` ou `Interface` (dependendo da versão do PCSX2).
   - Procure por **Ativar PINE** (ou *Enable PINE*) e certifique-se de que a porta esteja em **`28011`** (porta padrão).
2. **Instalar o patch 60 FPS / Anti-Freeze:**
   - Copie o arquivo `9F18CBC5.pnach` para a pasta `cheats` do seu PCSX2:
     - *PCSX2 Standalone:* `Documents/PCSX2/cheats/` ou `PCSX2/cheats/`
   - No emulador, certifique-se de marcar: `Sistema` ➔ `Ativar Cheats`.

---

### Executando o Companion App:

#### Opção A: Executável Pronto (Recomendado)
- Basta dar duplo clique no arquivo **`Abrir Companion.bat`** (ou no atalho `MS Saga Companion.lnk`) na raiz do repositório. O aplicativo já está compilado e pronto para uso sem necessidade de instalar dependências.

#### Opção B: Modo de Desenvolvimento
Caso queira modificar o código da interface:
```powershell
# 1. Navegue até a pasta do companion
cd companion

# 2. Instale as dependências
npm install

# 3. Inicie em modo de desenvolvimento com hot-reload
npm run dev

# 4. Para gerar um novo build empacotado:
npm run build
```

---

## 6. Mapa de Memória EE (PlayStation 2)

Para desenvolvedores e modders que desejem inspecionar o jogo diretamente, aqui estão os principais endereços mapeados na RAM da Emotion Engine (32 MB):

| Endereço RAM | Tipo / Tamanho | Descrição |
| :--- | :--- | :--- |
| `0x00100000` | — | Início do código residente (`SLUS_212.70` `.text`) |
| `0x00385080` | `struct` | Tabela de símbolos SN Systems `SNR1` (5.763 símbolos exportados) |
| `0x003C98A8` | `uint32` | Bitmask de botões pressionados no Controle 1 (`sys_pad`) |
| `0x003CAB60` | `pointer` | `g_DllListHead` — Cabeça da lista encadeada de DLLs dinâmicas ativas |
| `0x00442CC0` | `uint32` | Contador mestre de VBlanks físicos (60 Hz) |
| `0x00442CC8` | `int32` | `g_SysVsyncTargetInterval` (`1` = 60 FPS, `2` = 30 FPS) |
| `0x00516A00` | `buffer` | `dll_buf` — Região de RAM onde o overlay dinâmico atual é carregado |
| `0x01FDEDBC` | `struct[6]` | Slots de Mobile Suits ativos do esquadrão |
| `0x01FFF460` | `uint8[3]` | Relógio de jogo do Save: Horas (`+0`), Minutos (`+1`), Segundos (`+2`) |
| `0x01FFF5AE` | `uint8` | `CurrGameMode` (`0`=Title, `2`=Dungeon, `3`=Town, `4`=World, `5`=Battle) |
| `0x01FFF5B4` | `bitfield` | Flags de eventos da campanha e baús abertos |

---

## 7. Licença e Créditos

- **Engenharia Reversa, PNACH & Companion App:** Desenvolvido por Victor Favretto (`vfavretto`).
- **Comunidade:** Agradecimentos aos guias canônicos de *Dragen* e *cs_meelee* (GameFAQs) pelas confirmações de rotas secundárias e nomenclaturas em inglês.
- **Isenção Legal:** Este projeto não distribui ROMs, ISOs ou chaves protegidas por direitos autorais. Todo o trabalho foi realizado exclusivamente para fins de preservação histórica, acessibilidade e estudo de engenharia reversa. *MS Saga: A New Dawn*, *Mobile Suit Gundam* e todas as marcas associadas são propriedades de seus respectivos detentores (Bandai Namco / Sunrise / Sotsu).
