# MS Saga: A New Dawn (`SLUS_212.70`) — Reverse Engineering State

> **Jogo:** MS Saga: A New Dawn (NTSC-U) — Codinome Interno: `GRPG` (`d:/projects/GRPG/`)
> **Executável Principal:** `SLUS_212.70` | **PCSX2 Game CRC:** `9F18CBC5` (`9F18CBC5.pnach`)
> **MD5 (`SLUS_212.70`):** `9a197f27b0c16fa0277c0685701509d8`
> **Engine / Middleware:** BEC Custom Engine (`SYS` / `B3D` / `DISC` / `SWEF` / `FSF`) sobre **RenderWare 3.6 (`RW36Active`)** + **CRI Middleware (`ADXT` / `ADXF` / `Sofdec`)** + **SN Systems ProDG Relocatable DLLs (`SNR1`)**

---

## 1. Mapa de Memória (EE RAM — 32 MB) & Conversão VMA → ELF

O `SLUS_212.70` possui um único Program Header `PT_LOAD`:
- `p_vaddr  = 0x00100000`
- `p_offset = 0x00001000`
- `p_filesz = 0x002C962C` (cobre de `0x00100000` até `0x003C962C`)
- **Fórmula Exata para Patch na ISO (`SLUS_212.70`):**
  `ELF_File_Offset = RAM_Address - 0x000FF000` *(válido para `.text`, `.data`, `.sndata`, `.rodata`, `.lit4`, `.sdata`)*

| Seção / Região | Início (RAM) | Fim (RAM) | Perm | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `.text` | `0x00100000` | `0x0028528F` | `r-x` | Código residente da engine (`SYS`, `GAME`, `SWEF`, `DISC`, `B3D`, `LD*`, `RenderWare`, `CRI`, `Sony SDK`) |
| `.data` | `0x00285300` | `0x0038502F` | `rwx` | Tabelas globais inicializadas, tabelas de modos/DLLs, pipelines VU1 do RenderWare |
| `.sndata` | `0x00385080` | `0x003B3313` | `rw-` | **Tabela de Símbolos `SNR1` (`sn_dll_header_root`)** — **5.763 símbolos originais** exportados para os módulos `.rel`! |
| `.rodata` | `0x003B3380` | `0x003C8847` | `r--` | Strings de erro/debug, caminhos de IRX, nomes de cidades/dungeons, constantes `float` |
| `.lit4` / `.sdata` | `0x003C8880` | `0x003C962B` | `rw-` | Constantes `float` de 4 bytes e dados curtos (`_gp = 0x003D0870`) |
| `.sbss` | `0x003C9680` | `0x003C9903` | `rw-` | Variáveis globais rápidas (`sys_pad`, `gEvtStat`, flags RenderWare) |
| `.bss` | `0x003C9980` | `0x0115D000` | `rw-` | Estado da engine, timers (`0x003C9B08`), `dll_buf` (`0x00516A00`, buffer onde os overlays `.rel` são carregados!) |
| `Heap` | `0x0115D000` | `0x01EDD000` | `rw-` | Heap principal (`_heap_size = 0x00D80000`) |
| `Stack` | `0x01EDD000` | `0x01FDD000` | `rw-` | Stack da thread principal (`_stack_size = 0x00100000`) |
| `High RAM (Save/Party)` | `0x01FDD000` | `0x01FFFFFF` | `rw-` | Dados persistentes da sessão/save: Party MS (`~0x01FDEDBC`), PlayTime (`0x01FFF460`), GameMode atual (`0x01FFF5AE`), Event Flags (`0x01FFF5B4`) |

---

## 2. Descoberta Chave: Arquitetura de Overlays Dinâmicos (`.rel` / `SNR1`)

O jogo divide o código em **duas camadas**:
1. **Engine Residente (`SLUS_212.70`):** Contém o `SYS_MainLoop`, agendador de tasks, renderizador/animador 3D (`B3D_Main`), efeitos de transição/fade (`SWEF_*`, `EDEF_*`), gerenciador de disco/AFS (`DISC_*`), carregadores assíncronos de modelos/animações de batalha (`LDMS_*`, `LDBA_*`, `LDBE_*`), som e UI básica (`FSF_*`). Possui **5.763 nomes originais preservados** na seção `.sndata` (`magic = "SNR1"`, `sym_table = 0x0039EC3C`).
2. **Módulos de Gameplay (`AFSLIST0.AFS`, arquivos `[0000]` a `[0010]`):** Comprimidos (`CMP0`/`RLN0`, descomprimidos por `PS_DecSucc` em `0x00106960`) e carregados dinamicamente no buffer fixo `dll_buf` (`0x00516A00`) via `SYS_RgstDLL` / `SYS_DLLMain`:

| Índice AFS (`DLL ID`) | Nome no `AFSLIST0.AFS` | Tamanho Compr. | `GameMode` (`0x01FFF5AE`) | `GAME_Main` State | Propósito |
| :---: | :--- | ---: | :---: | :---: | :--- |
| `0` | `title_dll.cmp` | 100.984 B | `0` | `0x0B` (init) / `0x14` (loop) | Tela de Título |
| `1` | `staff_dll.cmp` | 9.484 B | `1` | `0x0E` / `0x15` | Créditos (`Staff Roll`) |
| `2` | `bmap_dll.cmp` | 419.420 B | `4` | `0x11` / `0x18` | **World Map (`Big Map`)** — movimento no mapa-múndi |
| `3` | `fmap_dll.cmp` | 360.828 B | `2` | `0x0F` / `0x16` | **Field / Dungeon Map** — movimento nas dungeons/áreas |
| `4` | `sento_dll.cmp` | 505.568 B | `5` | `0x12` / `0x19` | **Sistema de Batalha (`Sento` = 戦闘)** — turnos, câmeras e lógica de combate |
| `5` | `sub_dll.cmp` | 187.704 B | — | (sub-overlay) | Menu Principal / Camp Menu |
| `6` | `tmap_dll.cmp` | 414.056 B | `3` | `0x10` / `0x17` | **Town Map** — movimento nas cidades |
| `7` | `emov_dll.cmp` | 65.108 B | `6` | `0x13` / `0x1A` | Reprodução de Cutscenes FMV (`Movie`) |
| `8` | `haichi_dll.cmp` | 590.932 B | — | Debug | Editor/Debug de posicionamento (`Haichi`) |
| `9` | `stest_dll.cmp` | 544.480 B | — | Debug | Debug Battle/Effect Test |
| `10` | `sound_dll.cmp` | 16.920 B | — | Debug | Debug Sound Test |
| `11` | `dllfsize.cmp` | 60 B | — | Boot (`case 3`) | Tabela de tamanhos descomprimidos das DLLs |

---

## 3. Funções Identificadas e Renomeadas no Ghidra

| Endereço | Nome no Ghidra | Origem do Nome | Papel Confirmado |
| :--- | :--- | :--- | :--- |
| `0x00100008` | `entry` | ELF Entry | Limpa `.sbss`/`.bss` até `0x0115D000`, configura Thread/Heap e chama `main` |
| `0x0010E1C8` | `main` | `SNR1` | Chama `__main`, `SYS_InitEngine` (`0x0010E1F8`) e entra em `SYS_MainLoop` (`0x0010E618`) |
| `0x0010E1F8` | `SYS_InitEngine` | Análise | Carrega módulos IRX (`IOPRP280`, `CDVDSTM`, `CRI_ADXI`, `RPGSND`), inicia `FIFO`, `DISC`, `B3D`, registra `GAME_Main` como task raiz e instala handler de VBlank (`0x0010F800`) |
| `0x0010E618` | `SYS_MainLoop` | Análise | **Loop de Frame Principal:** `SYS_WaitVsync` → `ADXM_ExecMain` → `SYS_ReadPad(0/1)` → `SNDDRV_Main` → `DISC_Main` → `FSF_Man` → `SYS_TaskMain` → `SYS_DLLMain` → `MOVIE_Main` → `B3D_Main` → `B3D_ShowRaster` (e trata Soft-Reset `L1+L2+R1+R2+Start+Select`) |
| `0x0010FE60` | `SYS_WaitVsync` | Análise | Limita o framerate esperando `g_SysVsyncTargetInterval` (`0x00442CC8`) VBlanks via `MOVIE_VSyncWait` (`ADXM_WaitVsync`) |
| `0x0010F158` | `SYS_VsyncWakeUp` | `SNR1` | Define `g_SysVsyncTargetInterval` (`1` = 60 FPS, `2` = 30 FPS). Chamado com `2` no boot (`GAME_Main` `case 0x0B`), travando o jogo em **30 FPS**! |
| `0x0010F178` | `SYS_GetVsyncCnt` | `SNR1` | Retorna `g_SysVsyncCounter` (`0x00442CC0`, incrementado a 60 Hz na interrupção VBlank) |
| `0x0010F1F8` | `SYS_TaskMain` | Análise | Percorre lista encadeada de tasks ativas (`0x00438BF0`) executando callbacks de frame (`GAME_Main`, tasks de mapa/batalha/efeitos) |
| `0x0010F330` | `SYS_RgstTask` | `SNR1` | Registra uma nova task periódica na lista de execução |
| `0x0010E7B8` | `SYS_ReadPad` | Análise | Lê DualShock 2 (portas 0 e 1) e atualiza `sys_pad` (`0x003C98A8`), `sys_padTrig`, analógicos L3/R3 |
| `0x001003F0` | `GAME_Main` | `SNR1` | **Máquina de Estados Raiz:** gerencia boot, troca de modos (`Title`, `Field`, `Town`, `World`, `Battle`), carga/descarga de `.rel` DLLs e atualiza o relógio de tempo de jogo (`PlayTime`) |
| `0x00100AE0` | `GAME_PlayTimeCountStart` | `SNR1` | Inicia contagem de tempo de jogo sincronizando `g_PlayTime_CurrVsync` / `PrevVsync` |
| `0x00100B18` | `GAME_PlayTimeCountStop` | `SNR1` | Pausa contagem do relógio de jogo (ex: na tela de título) |
| `0x00106110` | `SYS_RgstDLL` | `SNR1` | Registra um módulo `.rel` para carregamento em `dll_buf` |
| `0x00106478` | `SYS_DLLMain` | `SNR1` | Máquina de estados de carga, descompressão e relocação dinâmica dos `.rel` |
| `0x0010B220` | `DISC_Main` | `SNR1` | Gerenciador central de leitura assíncrona CDVD/AFS e streaming ADX (ponto focal para investigação de deadlocks do Objetivo 2) |
| `0x00113550` | `B3D_VsyncCntSet` | `SNR1` | Repassa intervalo mínimo de VSync (`2` = 30 FPS) para `_rwDMAMinVsyncCntSet` (`0x001C73E8`) |
| `0x00113A30` | `B3D_Main` | `SNR1` | **Motor 3D & Stepper Global de Animações:** avança todas as animações esqueléticas, morphs, câmeras, UVs e partículas usando `(float)g_B3D_ElapsedVsyncs / 60.0f` e renderiza a cena! |
| `0x001159B0` | `B3D_ShowRaster` | `SNR1` | Apresenta o framebuffer renderizado na tela |
| `0x00129050` | `MOVIE_VSyncWait` | `SNR1` | Wrapper que chama `mwPlySwitchToIdle` → `ADXM_WaitVsync` |

*(Outras funções chave já localizadas via `SNR1` para os próximos passos: `SWEF_SwEffectBoot` `0x00100B58`, `EDEF_EndEffectBoot` `0x00100CB0`, `SWEF_FadeIn` `0x00100EB8`, `SWEF_FadeOut` `0x00100F28`, `LDBA_SetBtlAnm` `0x00129590`, `LDBE_SetBtlEff` `0x00129930`, `LDMS_SetModel` `0x00129E78`, `PS_DecSucc` `0x00106960`.)*

---

## 4. Ponteiros e Variáveis Globais Mapeadas

| Endereço | Nome no Ghidra | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| `0x00285720` | `g_GameModeToDllIdTbl` | `uint32[8]` | Mapeia `GameMode` (`0..6`) → índice de DLL no `AFSLIST0.AFS` (`[0, 1, 3, 6, 2, 4, 7, 0]`) |
| `0x00285740` | `g_GameModeToStateTbl` | `uint8[8]` | Mapeia `GameMode` (`0..6`) → case de inicialização em `GAME_Main` (`[11, 14, 15, 16, 17, 18, 19, 0]`) |
| `0x003C98A8` | `sys_pad` | `uint32` | Bitmask de botões pressionados no controle 1 |
| `0x003C9B04` | *(flag)* | `uint8` | `1` quando o PlayTime está contando |
| `0x003C9B08` | `g_PlayTime_CurrVsync` | `uint32` | VSync atual lido por `GAME_Main` (Seed confirmada!) |
| `0x003C9B0C` | `g_PlayTime_PrevVsync` | `uint32` | VSync anterior usado para calcular delta de frames do PlayTime (Seed confirmada!) |
| `0x003C9B10` | `g_PlayTime_SubSecFrames` | `uint32` | Acumulador de `0..60` (`0x3C`) VBlanks para somar 1 segundo ao PlayTime |
| `0x00442CC0` | `g_SysVsyncCounter` | `uint32` | Contador mestre de VBlanks (60 Hz) incrementado na interrupção `0x0010F800` |
| `0x00442CC8` | `g_SysVsyncTargetInterval` | `int32` | Alvo de VBlanks por frame (`2` = 30 FPS padrão do jogo; `1` = 60 FPS) |
| `0x00442CD0` | `g_SysVsyncElapsed` | `int32` | VBlanks decorridos durante o processamento do frame atual |
| `0x0044312C` | `g_B3D_ElapsedVsyncs` | `uint32` | Delta de VBlanks consumido pelo `B3D_Main` para avançar animações (`delta / 60.0f`) |
| `0x00516A00` | `dll_buf` | `uint8[]` | Buffer em RAM onde o overlay `.rel` ativo (`fmap`, `tmap`, `bmap`, `sento`) é carregado e relocado |
| `0x01FDEDBC` | *(High RAM)* | `struct[]` | Região dos Mobile Suits da Party (Seed do usuário — dentro do bloco de SaveState `0x01FDD000..0x01FFFFFF`) |
| `0x01FFF460` | *(High RAM)* | `uint8[3]` | Relógio do Save: Horas (`0x01FFF460`), Minutos (`0x01FFF461`), Segundos (`0x01FFF462`) |
| `0x01FFF5AD` | *(High RAM)* | `uint8` | `PrevGameMode` |
| `0x01FFF5AE` | *(High RAM)* | `uint8` | `CurrGameMode` (`0`=Title, `1`=Staff, `2`=Field/Dungeon, `3`=Town, `4`=WorldMap, `5`=Battle, `6`=Movie) |

---

## 5. Diagnóstico de Raiz: Travamentos, Deadlocks e Bugs em 60 FPS / Turbo / Fast-Forward

A auditoria completa de `SLUS_212.70` e dos 12 overlays `.rel` (`SD0` descomprimidos de `AFSLIST0.AFS`) revelou **6 causas exatas** dos travamentos e anomalias quando o jogo é acelerado ou destravado para 60 FPS:

1. **Spinloops Infinitos na Fila MIDI/SE do IOP (`SND_Main` — `0x00112BE8..0x00112CD0`):**
   - `SND_Main` envia mensagens de som/SE para o driver `RPGSND` no IOP via `sceMSIn_PutMsg` (`0x00112C08`) e `sceMSIn_PutHsMsg` (`0x00112C58`, `0x00112CB8`).
   - Quando a fila SPU2/IOP enche durante aceleração (`2x`/`3x` ou Fast-Forward `>60 FPS`), essas funções retornam `< 0` e o jogo entra num `while (ret < 0)` **síncrono na thread principal EE** (`beq $zero, $zero, -5` = `0x1000FFFB`), impedindo que `SYS_MainLoop` rode o próximo VSync/SIF sync e causando **hard-freeze permanente com música tocando ao fundo**.
   - **Correção:** Redirecionar os 3 spinloops (`0x00112C08`, `0x00112C58`, `0x00112CB8`) para o epílogo da função (`0x00112CE8`), cedendo a CPU e tentando novamente no próximo VBlank.
2. **Spinloop Síncrono em `DISC_Main` (`ADXF_OpenAfs` — `0x0010B790`):**
   - Ao abrir partições AFS quando um handle CRI ADX ainda está sendo liberado pelo IOP, `ADXF_OpenAfs` retorna `0` e `0x0010B790` executa `beq $zero, $zero, 0x0010B780` (`0x1000FFFB`) sem rodar `ADXM_ExecMain()`, travando a abertura de arquivos em transições rápidas Mapa ↔ Batalha.
   - **Correção:** Em `0x0010B790`, saltar para `0x0010B874` (`0x10000038`, pulando `ADXF_Close` pois `$s7 == 0`) para que `ADXM_ExecMain()` processe o IOP no próximo VBlank e retente com segurança.
3. **Exceção `break 7` (Divisão por Zero) via `SYS_GetVsyncVal` (`0x0010F168`):**
   - Múltiplos overlays `.rel` (`title_dll`, `fmap_dll`, `bmap_dll`, `tmap_dll`, `sento_dll`, `sub_dll`, `emov_dll`) calculam taxas e contadores dividindo por `SYS_GetVsyncVal()` (`0x00442CC8`), seguido de `bne $v0, $zero, +8; break 7`.
   - **Correção:** `SYS_GetVsyncVal` (`0x0010F168`) passa a retornar sempre a constante `2` para a lógica dos `.rel`, enquanto `0x00442CC8` (`g_SysVsyncTargetInterval`) e `0x003C941C` (`_rwDMAMinVsyncCnt`, `uint8`) recebem `1` (60 FPS) diretamente em `Mod_WaitVsync` (`2` durante FMVs).
4. **Concorrência de Carga Assíncrona (Disco / Relocação `.rel` / Bancos de Áudio / Assets de Batalha):**
   - Rodar múltiplos ticks lógicos (`SYS_TaskMain`) por frame enquanto `DISC_Main` (`0x003D7941`, `0x003D7942`, slots `0x003CABB0`), `SYS_DLLMain` (lista `0x003CAB60` com `status != 2` ou `unload_flag != 0`), `SNDDRV` (5 slots de transferência de bancos SE em `0x00442D4C + i*6`) ou os loaders assíncronos de batalha `LDBN` (`0x00286068`), `LDBA` (`0x0028606C`) e `LDBE` (`0x00286074`) estão ativos esgota janelas de espera antes do CDVD/IOP concluir o DMA.
   - **Correção (`Mod_CheckAutoGuard`):** Inspeciona todos esses subsistemas (inclusive **entre o Sub-tick 1 e o Sub-tick 2** no modo `3x`!) e força automaticamente `1x` até o carregamento terminar (além de cair para `1x` enquanto o Camp Menu `sub_dll` estiver aberto).
5. **Ciclo de Vida das Primitivas 2D / Texto (`FSF_Man` `0x001221F8` vs `B3D_Main` `0x00113A30`):**
   - `B3D_Main` renderiza listas encadeadas **retidas** (`0x00285E80`, `0x00285E84` `2DDrawPrim`, `0x00285E88`) sem desvinculá-las ao fim do render. Quem chama `B3D_UnLink2DDrawPrim` nos glifos do tick anterior é `FSF_Man` (`0x001221F8` → `0x001240D8`).
   - **Correção:** `0x0010E6AC: jal FSF_Man` em `SYS_MainLoop` foi substituído por `nop` e movido para dentro de `Mod_RunFrameLogic` imediatamente antes de **cada** execução de `SYS_TaskMain`. Assim:
     - Nos frames ímpares (`0` ticks) em `1x (60 FPS)`, os glifos e HUD 2D permanecem vinculados e são redesenhados a 60 FPS **sem qualquer flicker de 30 Hz**.
     - Nos frames de `2` ticks em `3x`, `FSF_Man` limpa os glifos do Tick 1 antes do Tick 2, **eliminando estouro de pool / double-link**.
6. **Dessincronia / Underflow do `PlayTime` (`0x001009D4` e `0x00100AE8`):**
   - Como `SYS_GetVsyncCnt` (`0x0010F178`) é virtualizado para avançar `+2` por tick lógico (`g_SimVsyncCounter`), tanto `GAME_Main` (`0x001009D4`) quanto `GAME_PlayTimeCountStart` (`0x00100AE8`, chamado ao carregar um Save) foram alterados para ler diretamente o contador físico de 60 Hz (`0x00442CC0`), mantendo o relógio do Save em tempo real `1x` sem saltos no Load Game.

---

## 6. Offsets Descobertos nos Módulos Dinâmicos `.rel` (`SD0` Descomprimidos)

Os módulos `.cmp` de `AFSLIST0.AFS` usam o container **`SD0`** (`magic = 0x00304453`, header de 16 bytes + bitstream LZSS/RLE descomprimido por `PS_DecSucc` em `0x00106960`). Após `snDllLoaded` (`0x00132318`) relocar o módulo em `dll_base` (`lw 4($s1)`, tipicamente `0x00516A00`), os offsets relativos a `dll_base` são:

| Módulo (`dll_id`) | Funcionalidade | Offset (`+dll_base`) | Instrução / Dado Original | Patch Aplicado por `Mod_ApplyDllPatches` |
| :--- | :--- | :--- | :--- | :--- |
| **`bmap_dll` (`2`)** | Texto Instantâneo | `+0x080DB0..+0x080DB8` | `float[3] {0.5f, 1.5f, 3.0f}` (`EVMA_msg_speed`) | `0.02f, 0.02f, 0.02f` (`0x3CA3D70A`) |
| **`bmap_dll` (`2`)** | Controle de Encontros | `+0x00AD60..+0x00AD64` | `EncSuppressChk` prólogo (`lui $v0, 0x200; lh...`) | `j Mod_EncSuppressHook; nop` |
| **`bmap_dll` (`2`)** | Controle de Encontros | `+0x00A260` | `sw $v0, 0($sp)` (`EncUpdate` head) | `jal Mod_EncHeadHook` |
| **`bmap_dll` (`2`)** | Controle de Encontros | `+0x00AB9C` | `daddu $s5, $s1, $zero` (`EncUpdate` walk) | `jal Mod_EncWalkHook` |
| **`bmap_dll` (`2`)** | Controle de Encontros | `+0x00ABE0` | `jal GetStepThreshold` (`+0x00A150`) | `jal Mod_EncStepRollHook` |
| **`fmap_dll` (`3`)** | Texto Instantâneo | `+0x071B58..+0x071B60` | `float[3] {0.5f, 1.5f, 3.0f}` (`EVMA_msg_speed`) | `0.02f, 0.02f, 0.02f` (`0x3CA3D70A`) |
| **`fmap_dll` (`3`)** | Controle de Encontros | `+0x006A28..+0x006A2C` | `EncSuppressChk` prólogo | `j Mod_EncSuppressHook; nop` |
| **`fmap_dll` (`3`)** | Controle de Encontros | `+0x005F28` | `sw $v0, 0($sp)` (`EncUpdate` head) | `jal Mod_EncHeadHook` |
| **`fmap_dll` (`3`)** | Controle de Encontros | `+0x006864` | `daddu $s5, $s1, $zero` (`EncUpdate` walk) | `jal Mod_EncWalkHook` |
| **`fmap_dll` (`3`)** | Controle de Encontros | `+0x0068A8` | `jal GetStepThreshold` (`+0x005E18`) | `jal Mod_EncStepRollHook` |
| **`sento_dll` (`4`)** | Texto Instantâneo | `+0x086728..+0x086730` | `float[3] {0.5f, 1.5f, 3.0f}` (`EVMA_msg_speed`) | `0.02f, 0.02f, 0.02f` (`0x3CA3D70A`) |
| **`sento_dll` (`4`)** | Vitória 4x Mais Rápida | `+0x009024`, `+0x009064` | `slti $v1, $v0, 80` / `slti $v1, $v0, 40` | `20` (`0x28430014`) / `10` (`0x2843000A`) |
| **`sento_dll` (`4`)** | 100% Drop Rate Válido | `+0x00679C..+0x0067A0` | `lw $v1, 16($v0); addiu $v0, $zero, 200` | `jal Mod_Sento_DropHook; lw $v1, 16($v0)` |
| **`sento_dll` (`4`)** | 4x EXP & 4x Gold | `+0x009164..+0x009168` | `lhu $v0, 28($s4); sh $v0, 44($sp)` | `jal Mod_Sento_ExpGoldHook; nop` |
| **`sub_dll` (`5`)** | Detecção Camp Menu | `+0x02E490` | `uint32` lido por `SBMF_SubMainQuery` (`+0x0002B8`) | Lido por `Mod_CheckAutoGuard` (`!= 0` → `1x`) |
| **`tmap_dll` (`6`)** | Texto Instantâneo | `+0x077F80..+0x077F88` | `float[3] {0.5f, 1.5f, 3.0f}` (`EVMA_msg_speed`) | `0.02f, 0.02f, 0.02f` (`0x3CA3D70A`) |

---

## 7. Mapa de Memória do Mod (`9F18CBC5.pnach` — `0x003B0000..0x003B2824`)

Toda a lógica residente foi alojada na região 100% zerada ao final de `.sndata` (`0x003B0000..0x003B2900`, dentro do único `PT_LOAD` de `SLUS_212.70`, permitindo porte direto `1:1` para patch em ISO `ELF_Offset = VMA - 0x000FF000`):

| Endereço (RAM) | Símbolo / Estrutura | Descrição |
| :--- | :--- | :--- |
| `0x003B0004` | `Mod_WaitVsync` | Configura `0x00442CC8 = 1` e `0x003C941C = 1` (60 FPS) ou `2` (30 FPS em FMV) e salta para `SYS_WaitVsync` |
| `0x003B004C` | `Mod_B3D_SetElapsed` | Alimenta `B3D_Main` (`0x0044312C`) com `g_ModVisualVsyncs` (`1` em 60 FPS `1x`, `2` em `2x`, `2`/`4` em `3x`) |
| `0x003B006C` | `Mod_FadeStep4x` | Multiplica o passo de fade (`$s3` em `FUN_00104D98`) por `4`, limitado a `[-127, +127]` |
| `0x003B009C` | `Mod_CheckAutoGuard` | Retorna `1` se houver I/O de disco, relocação de `.rel`, banco `SNDDRV`, loader `LDBN`/`LDBA`/`LDBE` ou Camp Menu ativo |
| `0x003B0204` | `Mod_DrawOsd` | Desenha toast temporário (~2s) em `(16, 16)` com sombra `1px` usando `FSF` (`camera = 23`, `priority = 254`) |
| `0x003B0380` | `Mod_RunFrameLogic` | Lê `Select + R1` (`0x0100 + 0x0008`) e `Select + L1` (`0x0100 + 0x0004`), acumula inputs em frames ímpares e despacha `FSF_Man` + `SYS_TaskMain` |
| `0x003B06A0` | `Mod_Enc*Hook` | Hooks residentes de `EncSuppressChk`, `EncUpdate` e `GetStepThreshold` para `NO ENCOUNTERS` e `GRIND 4X` |
| `0x003B07C0` | `Mod_Sento_DropHook` | Em `GRIND 4X`, promove slots válidos de drop (`item_id != 0 && != 0xFFFF`, `1 <= rate <= 200`) para `200` (`100%`) |
| `0x003B0804` | `Mod_Sento_ExpGoldHook` | Em `GRIND 4X`, multiplica EXP (`24($s4)`) e Gold (`28($s4)`) de 32 bits por `4` (teto `999.999`; UI 16 bits limitada a `65.535`) |
| `0x003B086C` | `Mod_ApplyDllPatches` | Aplica patches em `dll_buf` por `dll_id` (`2`, `3`, `4`, `6`) + `FlushCache(0)` e `FlushCache(2)` (suporta boot e Save States já carregados!) |
| `0x003B0B8C` | `Mod_OnDllLoaded` | Hook em `0x001066B8` (`SYS_DLLMain`) pós-`snDllLoaded` |
| `0x003B2000` | `g_ModOsdStrings` | 6 strings ASCII alinhadas a 32 bytes (`0x003B2000..0x003B20B4`) |
| `0x003B2800` | `g_ModState` | Estado mutável em tempo de execução (`init_done`, `speed_mode`, `enc_mode`, `sim_vsync`, `vis_vsyncs`, `osd_timer`, `pad_accum`, ponteiros de continuação `.rel`) |

---

## 8. Notas e Pendências para a Próxima Fase (Porte para ISO / Refinamento do Turbo In-Game)

1. **Uso Atual com o Turbo Nativo do PCSX2 (Opção A Validada):**
   - Com os 4 patches anti-spinloop ativos em `SND_Main` (`0x00112C08`, `0x00112C58`, `0x00112CB8`) e `DISC_Main` (`0x0010B790`) + proteção `SYS_GetVsyncVal` (`0x0010F168`) + base a `60 FPS` (`1x`), o **Turbo / Fast-Forward nativo do PCSX2** acelera mapas, batalhas, áudio e animações em conjunto sem provocar *race conditions* ou congelamentos.
2. **Por que o Turbo Interno (`Select + R1` — `2x`/`3x`) fica retido em `1x` na v2 (Para Resolver no Porte para ISO):**
   - **Causa 1 (`Mod_CheckAutoGuard` excessivamente restritivo em `0x003B009C`):**
     - A verificação atual de `DISC` (`0x003D7941`, `0x003D7942`, e os 10 slots em `0x003CABB0`) e dos 5 slots de banco de som `SNDDRV` (`0x00442D4C`, `state != 0`) retorna `1` (*ocupado*) sempre que há **streaming contínuo de BGM (CRI ADX)** ou bancos de áudio residentes carregados (estado `2`/`3` = residente, enquanto apenas o estado `1` indica transferência ativa de IOP). Como há BGM tocando durante quase todo o mapa e batalha, `Mod_CheckAutoGuard` força `1x` continuamente, exceto em breves pausas de áudio/diálogo.
     - **Solução futura:** Restringir `Mod_CheckAutoGuard` apenas a carregamentos reais de transição:
       1. Lista de `.rel` em `SYS_DLLMain` (`0x003CAB60`: `node->status != 2` ou `node->unload_flag != 0`).
       2. Loaders assíncronos de batalha `LDBN` (`0x00286068`, `state == 1`), `LDBA` (`0x0028606C`, `state == 1 || 2`) e `LDBE` (`0x00286074`, `state == 1 || 2`).
       3. Camp Menu aberto (`sub_dll + 0x02E490 != 0`).
       4. Em `SNDDRV` (`0x00442D4C`), checar estritamente `state == 1` (transferência em andamento) em vez de `state != 0`, e ignorar os canais contínuos de streaming ADX (`0x003D7941`/`0x003D7942`).
   - **Causa 2 (Passo de Animação 3D em Batalha / Mapa via `B3D_Main`):**
     - Ao rodar `2x`/`3x` in-game mantendo o VSync físico em 60 Hz (`VPS: 60`), verificar se algum sub-sistema de câmera/efeito de `sento_dll` lê `0x0044312C` (`B3D_GetVSyncInterval`) durante `SYS_TaskMain` para avançar interpolações (onde atualmente fixamos `2` por sub-tick) ou se depende exclusivamente do passo de `B3D_Main` (`Mod_B3D_SetElapsed` em `0x00113AA8`).
3. **Problema do Modo Analógico no PCSX2 (`L3`/`R3`):**
   - `SYS_ReadPad` (`0x0010F034..0x0010F0EC`) só executa `scePadSetMainMode(0, 0, 1, 3)` uma única vez no boot frio (quando `*(u8*)0x00442CD6` chega a `0xFF`, nunca mais reexecuta). Se um Save State ou reconfiguração do PCSX2 resetar o DualShock 2 para Modo Digital (`*(u8*)0x004388C1 == 0x41`), `L3`/`R3` ficam desativados até que `0x00442CD6` seja zerado ou se utilizem atalhos digitais como `Select + L1` / `Select + R1`.
4. **Velocidade do Texto (`EVMA_msg_speed` — `0.02f` ficou 25x mais lento que o modo Lento):**
   - Na tabela original `EVMA_msg_speed` (`{0.5f, 1.5f, 3.0f}`), o valor representa **caracteres por tick** (maior = mais rápido: `0.5` = Lento, `1.5` = Normal, `3.0` = Rápido), enquanto `0.0f` é tratado por um `if (speed == 0.0f)` especial que exibe `0xFFFF` caracteres de uma vez.
   - Ao substituir `0.0f` por `0.02f` (`0x3CA3D70A`) na v2, a velocidade passou a ser `0.02` caracteres por tick (1 letra a cada 50 ticks = extremamente lento).
   - **Solução:** Voltar `EVMA_msg_speed[0..2]` para `0.0f` (ou usar um float alto como `64.0f` = `0x42800000`, 64 caracteres por tick) e, se necessário para balões que não leem `EVMA_msg_speed`, restaurar o patch em `MSF_MsgCreate` (`+0x052BAC` em `fmap`, `+0x05D8CC` em `bmap`, `+0x04F2BC` em `sento`, `+0x0446D4` em `tmap`).
