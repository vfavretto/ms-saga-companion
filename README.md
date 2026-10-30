# MS Saga Companion & Reverse Engineering Toolkit

Companion App tático e conjunto de ferramentas de engenharia reversa para o RPG **MS Saga: A New Dawn** (PlayStation 2 - `SLUS_212.70`).

O app se conecta em tempo real ao emulador **PCSX2** via protocolo **PINE** (IPC de memória), rastreando a campanha, objetivos, baús, esquadrão, créditos, bestiário completo e itens perdíveis (*missables*).

---

## 🚀 Funcionalidades

- **Detonado & Rastreador de Baús (180 Baús):** Passo a passo detalhado cobrindo todos os 5 Atos e 15 Capítulos, com checklist persistente para todos os 180 baús do jogo.
- **Sincronização Ao Vivo (PCSX2 PINE):**
  - Leitura direta da memória do jogo sem travar o emulador.
  - Telemetria de créditos (Gold/C), status de combate/mapa/cidade e slots da party ativa.
- **Bestiário Completo (270 Inimigos):**
  - Dados oficiais extraídos diretamente do jogo (HP, EN, EXP, Gold, fraquezas elementais, drops e locais canônicos).
  - Inclui chefes opcionais e inimigos raros como *Prototype Zaku* e *Black Assassin*.
- **Alertas de Missables:** Notificações e guia de itens e eventos que podem ser perdidos permanentemente na campanha.
- **Enciclopédia de Mobile Suits & Armas:** Lista de MSs, atributos de frames, armas e requisitos de crafting no G-System.
- **Interface Retrô Sci-Fi:** Tema militar/tático com efeitos visuais CRT e áudio retro personalizáveis.

---

## 📁 Estrutura do Repositório

```
MSSAGA-PROJECT/
├── companion/             # Aplicativo Electron + React + TypeScript + TailwindCSS
│   ├── electron/          # Backend Electron e cliente PINE IPC
│   ├── src/               # Interface, componentes HUD e bases de dados JSON
│   └── package.json
├── extractor/             # Scripts em Python para descompressão e análise dos dados do jogo (AFS / DLLs)
├── 9F18CBC5.pnach         # Arquivo de patches/pnach para PCSX2
├── Abrir Companion.bat    # Launcher rápido para Windows
└── MSSAGA_REVERSE_STATE.md# Documentação técnica da engenharia reversa e offsets de memória
```

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (v18+)
- [PCSX2](https://pcsx2.net/) (com a opção PINE IPC ativada na porta padrão `28011`)

### Instalação e Execução do Companion
```bash
# Entrar na pasta do app
cd companion

# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## 📜 Licença
Projeto desenvolvido para fins educacionais e de preservação de jogos retrô. Todos os direitos de *MS Saga: A New Dawn* e *Mobile Suit Gundam* pertencem à Bandai Namco / Sunrise.
