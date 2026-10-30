import json
import os

os.makedirs("extractor/data", exist_ok=True)

# 1. PILOTS DATASET
pilots_data = [
    {
        "id": "tristan",
        "name": "Tristan",
        "role": "Main Protagonist",
        "description": "Young pilot seeking revenge for the destroyed orphanage. Balanced all-around melee and shooting fighter.",
        "skills": [
            {"name": "Sonic Storm", "level": 1, "en_cost": 2, "effect": "Melee attack that damages all enemies in line."},
            {"name": "Snipe", "level": 10, "en_cost": 3, "effect": "Precision shot with elevated critical hit rate."},
            {"name": "Charge Up", "level": 20, "en_cost": 4, "effect": "Boosts all attack power by 50% for next turn."},
            {"name": "Final Impact", "level": 35, "en_cost": 6, "effect": "Massive single-target burst attack."}
        ],
        "strengths": ["Balanced melee and ranged", "High HP growth", "Versatile boost attacks"],
        "join_chapter": "Prologue"
    },
    {
        "id": "fritz",
        "name": "Fritz",
        "role": "Mechanic & Tactician",
        "description": "Tristan's childhood friend and engineering genius. High tactical intellect and defensive options.",
        "skills": [
            {"name": "Repair Unit", "level": 1, "en_cost": 2, "effect": "Restores 35% HP to a target Mobile Suit."},
            {"name": "Smoke Screen", "level": 8, "en_cost": 2, "effect": "Increases party evasion by 30% for 3 turns."},
            {"name": "System Hack", "level": 18, "en_cost": 4, "effect": "Inflicts Stun/Overheat on enemy machine."},
            {"name": "Grand Repair", "level": 30, "en_cost": 6, "effect": "Restores 60% HP and cures status ailments for whole party."}
        ],
        "strengths": ["Essential healer", "High defense and EN efficiency", "Crucial debuffs"],
        "join_chapter": "Prologue"
    },
    {
        "id": "aeon",
        "name": "Aeon",
        "role": "Mysterious Psychic / Newtype",
        "description": "A calm girl discovered inside the ancient G-System capsule. Possesses rare resonance with ancient Psycommu weaponry.",
        "skills": [
            {"name": "Mind Field", "level": 1, "en_cost": 2, "effect": "Deploys a barrier blocking energy beam attacks."},
            {"name": "Psycommu Link", "level": 14, "en_cost": 4, "effect": "Guarantees 100% accuracy and increases Funnel damage."},
            {"name": "Miracle Light", "level": 28, "en_cost": 5, "effect": "Revives a fallen Mobile Suit with 50% HP."}
        ],
        "strengths": ["Best Funnel/Psycommu user", "Beam defense shield", "High speed"],
        "join_chapter": "Chapter 2 (Mt. Heidi)"
    },
    {
        "id": "tremmie",
        "name": "Tremmie",
        "role": "Rebel Guerrilla Ace",
        "description": "Fierce guerrilla pilot from North America with blistering speed and deadly rapid-fire technique.",
        "skills": [
            {"name": "Barrage Shot", "level": 1, "en_cost": 3, "effect": "Fires a rapid 6-hit Gatling burst at random foes."},
            {"name": "Quick Step", "level": 12, "en_cost": 2, "effect": "Grants high dodge rate and immediate extra initiative."},
            {"name": "Gatling Rain", "level": 26, "en_cost": 5, "effect": "Unleashes heavy projectile rain on all enemies."}
        ],
        "strengths": ["Extreme agility", "High hit count for breaking enemy shields", "Rapid EN recovery"],
        "join_chapter": "Chapter 3 (Dark Continent)"
    },
    {
        "id": "gavane",
        "name": "Gavane",
        "role": "Veteran Mercenary / Heavy Gunner",
        "description": "Hard-boiled veteran pilot specializing in heavy cannons, bazookas and explosive ordnance.",
        "skills": [
            {"name": "Power Blast", "level": 1, "en_cost": 3, "effect": "Heavy explosive cannon strike ignoring 30% enemy armor."},
            {"name": "Armor Fortify", "level": 15, "en_cost": 3, "effect": "Reduces physical damage taken by 40%."},
            {"name": "Full Cannonade", "level": 32, "en_cost": 6, "effect": "Fires all installed artillery for devastating area damage."}
        ],
        "strengths": ["Highest physical armor", "Devastating artillery damage", "Great against armored bosses"],
        "join_chapter": "Chapter 4"
    },
    {
        "id": "lapis",
        "name": "Lapis",
        "role": "Cybernetic / Newtype Prodigy",
        "description": "Gifted young ace with supernatural reflex tuning and high-tier Gundam mastery.",
        "skills": [
            {"name": "Flash Strike", "level": 1, "en_cost": 3, "effect": "Super-fast beam saber strike with critical pierce."},
            {"name": "Hyperspeed Focus", "level": 16, "en_cost": 4, "effect": "Double attack actions for 1 turn."}
        ],
        "strengths": ["High speed and critical strike", "Exceptional Gundam synergy"],
        "join_chapter": "Chapter 5"
    }
]

with open("extractor/data/pilots.json", "w", encoding="utf-8") as f:
    json.dump(pilots_data, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/pilots.json")

# 2. MISSABLES SHIELD DATASET
missables_data = [
    {
        "id": "black-assassin",
        "title": "Black Assassin (Inimigo Exclusivo - Entrada 270 da Enciclopédia)",
        "category": "Inimigo Perdível",
        "severity": "CRITICAL",
        "location": "Arredores de Tohai / Área de Transição",
        "window": "Primeira visita à região de Tohai",
        "cutoff_point": "Avançar a história além dos eventos de Tohai sem ter enfrentado o Black Assassin bloqueia permanentemente o encontro.",
        "consequence": "Impossibilita completar 100% dos 270 registros do Bestiário e trava a conquista máxima do G-System Interno.",
        "instructions": "Assim que alcançar a região de Tohai, circule pelos arredores no mapa e force encontros aleatórios até que o Black Assassin apareça. Derrote-o e certifique-se de que a entrada foi registrada antes de prosseguir com a trama principal."
    },
    {
        "id": "impact-lance",
        "title": "Impact Lance (Lança de Impacto em Wyvern Ravine)",
        "category": "Arma Única em Baú",
        "severity": "HIGH",
        "location": "Wyvern Ravine - Sala do Chefe",
        "window": "Durante a exploração da caverna antes de abater o Chefe",
        "cutoff_point": "Vencer o combate do chefe nesta câmara teletransporta você imediatamente para fora de volta a Eisengrad.",
        "consequence": "Embora seja possível retornar com dificuldade mais tarde antes de ir para o continente americano, esquecer esse baú faz você perder uma das lanças de perfuração mais fortes do início do jogo.",
        "instructions": "Ao entrar na câmara do chefe no fundo do desfiladeiro de Wyvern, contorne a área e abra todos os baús laterais (onde está a Impact Lance) ANTES de interagir com o gatilho da batalha do chefe."
    },
    {
        "id": "short-barrel-beam-rifle",
        "title": "Short Barrel Beam Rifle & Estoques Especiais de Lojas",
        "category": "Equipamento Limitado de Loja",
        "severity": "MEDIUM",
        "location": "Lojas de Eisengrad / Marie Foley",
        "window": "Antes do embarque no navio/continente americano",
        "cutoff_point": "Transição de atos e avanço de capítulos altera os estoques das lojas locais.",
        "consequence": "Armas de feixe compacto úteis para encaixar em grids pequenos de Mobile Suits ficam indisponíveis para compra.",
        "instructions": "Sempre compre ao menos 1 unidade de cada arma de feixe compacta ou escudo antes de embarcar nas viagens de travessia continental."
    }
]

with open("extractor/data/missables.json", "w", encoding="utf-8") as f:
    json.dump(missables_data, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/missables.json")

# 3. DETONADO INTERATIVO POR CAPÍTULOS
walkthrough_data = [
    {
        "id": "act-1",
        "title": "Ato 1: As Cinzas do Orfanato & A Fortaleza de Eisengrad",
        "region": "Europa",
        "chapters": [
            {
                "id": "prologue",
                "title": "Prólogo: O Ataque Misterioso",
                "location": "Orfanato & Arredores",
                "summary": "Tristan e Fritz retornam ao orfanato apenas para encontrá-lo em chamas por um ataque inexplicável da brigada inimiga. Tristan sobe a bordo do Zaku I para dar início à sua vingança.",
                "objectives": [
                    {"id": "obj-1", "text": "Tutorial de combate: Aprenda os comandos básicos de ataque e uso de EN com o Zaku I."},
                    {"id": "obj-2", "text": "Derrote os invasores e investigue os escombros do orfanato."},
                    {"id": "obj-3", "text": "Parta com Fritz em direção à cidade de Marie Foley em busca de respostas."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-pro-1", "location": "Escombros do Orfanato - Canto Leste", "item": "Repair Kit", "opened": False},
                    {"id": "ch-pro-2", "location": "Saída do Vilarejo", "item": "500 Gold", "opened": False}
                ],
                "boss": None
            },
            {
                "id": "ch-1-marie-foley",
                "title": "Capítulo 1: O Refúgio em Marie Foley & O Monte Heidi",
                "location": "Marie Foley -> Mt. Heidi",
                "summary": "Chegada à pacífica Marie Foley. Fritz descobre que antigas ruínas no Monte Heidi guardam um G-System adormecido e tecnologia capaz de forjar novos Mobile Suits.",
                "objectives": [
                    {"id": "obj-4", "text": "Visite a oficina em Marie Foley e compre munição/kits para a viagem."},
                    {"id": "obj-5", "text": "Atravesse a trilha do Monte Heidi enfrentando Zakus e patrulhas."},
                    {"id": "obj-6", "text": "Encontre o núcleo do G-System 01 no fundo da caverna e liberte Aeon da cápsula criogênica."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-mh-1", "location": "Mt. Heidi - Nível 1 Caverna", "item": "Small Shield", "opened": False},
                    {"id": "ch-mh-2", "location": "Mt. Heidi - Plataforma Norte", "item": "Machine Gun Ammo x5", "opened": False},
                    {"id": "ch-mh-3", "location": "Mt. Heidi - Câmara do G-System", "item": "G-System Core Data", "opened": False}
                ],
                "boss": {
                    "name": "Zaku Commander Custom",
                    "hp": 1200,
                    "weakness": "Beam / Pierce (Perfuração)",
                    "danger_attacks": ["Cracker Grenade (Dano em Área)", "Heat Hawk Crush"],
                    "strategy": "Mantenha Fritz curando com Repair Kit enquanto Tristan usa Snipe ou ataques físicos focados na cabeça para reduzir a precisão do chefe."
                }
            },
            {
                "id": "ch-2-wyvern-ravine",
                "title": "Capítulo 2: O Desfiladeiro Wyvern Ravine",
                "location": "Wyvern Ravine -> Fortaleza de Eisengrad",
                "summary": "O caminho para a imponente cidade-fortaleza de Eisengrad passa pelo perigoso Wyvern Ravine. Prepare-se para emboscadas aéreas e recolha todos os itens antes do embate final.",
                "objectives": [
                    {"id": "obj-7", "text": "Navegue pelo labirinto de cânions de Wyvern Ravine."},
                    {"id": "obj-8", "text": "ATENÇÃO: Colete a Impact Lance no baú lateral da sala do chefe ANTES do combate!", "highlight": True},
                    {"id": "obj-9", "text": "Derrote o Comandante Vallas e suas tropas de choque."},
                    {"id": "obj-10", "text": "Apresente-se às autoridades militares da Fortaleza Eisengrad."}
                ],
                "missable_ids": ["impact-lance"],
                "chests": [
                    {"id": "ch-wr-1", "location": "Wyvern Ravine - Entrada Oeste", "item": "High-Grade Armor Plate", "opened": False},
                    {"id": "ch-wr-2", "location": "Wyvern Ravine - Ponte Quebrada", "item": "1200 Gold", "opened": False},
                    {"id": "ch-wr-3", "location": "Wyvern Ravine - Câmara do Chefe (Canto Noroeste)", "item": "Impact Lance", "opened": False, "is_missable": True}
                ],
                "boss": {
                    "name": "Gouf Custom & Tropas Vallas",
                    "hp": 2800,
                    "weakness": "Energy / Beam",
                    "danger_attacks": ["Heat Rod (Eletrocussão e Paralisia)", "Gatling Shield Sweep"],
                    "strategy": "Elimine primeiro os dois Zakus de escolta usando ataques em linha. Use o Mind Field de Aeon para bloquear feixes e concentre ataques de longo alcance para evitar o contra-ataque paralisante do Heat Rod."
                }
            }
        ]
    },
    {
        "id": "act-2",
        "title": "Ato 2: O Continente Sombrio & A Resistência",
        "region": "América do Norte",
        "chapters": [
            {
                "id": "ch-3-tohai",
                "title": "Capítulo 3: A Região de Tohai & O Inimigo das Sombras",
                "location": "Tohai & Arredores",
                "summary": "Ao chegar no novo continente, você descobre a base dos rebeldes liderados por Tremmie. Este é o ponto crítico do Black Assassin.",
                "objectives": [
                    {"id": "obj-11", "text": "ATENÇÃO MÁXIMA: Encontre e derrote o Black Assassin no mapa de Tohai antes de entrar no quartel general rebelde!", "highlight": True},
                    {"id": "obj-12", "text": "Recrute Tremmie para sua equipe."},
                    {"id": "obj-13", "text": "Desbloqueie os esquemas de montagem do Gundam clássico no G-System 02."}
                ],
                "missable_ids": ["black-assassin"],
                "chests": [
                    {"id": "ch-tohai-1", "location": "Tohai - Depósito Secreto", "item": "Beam Saber Mk-II", "opened": False},
                    {"id": "ch-tohai-2", "location": "Acampamento Rebelde", "item": "High Speed Booster", "opened": False}
                ],
                "boss": {
                    "name": "Black Assassin (Encontro Raro)",
                    "hp": 1800,
                    "weakness": "Physical / Explosive",
                    "danger_attacks": ["Shadow Slash (Alto crítico)", "Smoke Burst"],
                    "strategy": "Ele possui esquiva altíssima. Use a habilidade Snipe de Tristan ou o Psycommu Link de Aeon para ignorar a penalidade de mira."
                }
            }
        ]
    }
]

with open("extractor/data/walkthrough.json", "w", encoding="utf-8") as f:
    json.dump(walkthrough_data, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/walkthrough.json")
