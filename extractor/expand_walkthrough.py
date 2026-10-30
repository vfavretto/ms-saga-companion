import json
import shutil

full_walkthrough = [
    {
        "id": "act-1",
        "title": "Ato 1: O Orfanato & A Fortaleza de Eisengrad",
        "region": "Europa",
        "chapters": [
            {
                "id": "prologue",
                "title": "Prólogo: O Ataque Misterioso",
                "location": "Orfanato & Marie Foley",
                "summary": "Tristan e Fritz retornam ao orfanato apenas para encontrá-lo em chamas pela misteriosa brigada inimiga. Tristan sobe a bordo do Zaku I para dar início à sua jornada.",
                "objectives": [
                    {"id": "obj-1", "text": "Tutorial de combate: Aprenda os comandos básicos de ataque e uso de EN com o Zaku I."},
                    {"id": "obj-2", "text": "Derrote os invasores e investigue os escombros do orfanato."},
                    {"id": "obj-3", "text": "Parta com Fritz em direção à cidade de Marie Foley em busca de suprimentos."}
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
                "title": "Capítulo 1: O Refúgio em Marie Foley & Monte Heidi",
                "location": "Marie Foley -> Mt. Heidi",
                "summary": "Chegada à pacífica Marie Foley. Fritz descobre que antigas ruínas no Monte Heidi guardam o G-System 01 adormecido.",
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
                "summary": "O caminho para a imponente cidade-fortaleza de Eisengrad passa pelo perigoso Wyvern Ravine. Prepare-se para emboscadas e recolha todos os itens antes do embate final.",
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
                "summary": "Ao desembarcar no continente americano, você entra na zona de guerrilha. Encontre e derrote o Black Assassin imediatamente antes de avançar a trama principal.",
                "objectives": [
                    {"id": "obj-11", "text": "ATENÇÃO MÁXIMA: Encontre e derrote o Black Assassin nos encontros do mapa de Tohai antes de entrar no quartel general!", "highlight": True},
                    {"id": "obj-12", "text": "Recrute Tremmie para o esquadrão."},
                    {"id": "obj-13", "text": "Acesse a mina abandonada e resgate o comboio de suprimentos rebelde."}
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
            },
            {
                "id": "ch-4-fort-medea",
                "title": "Capítulo 4: Infiltração em Fort Medea & Os Diggings",
                "location": "Fort Medea -> Cidade dos Diggings",
                "summary": "Uma ofensiva relâmpago para desativar as baterias de canhões antiaéreos de Fort Medea e liberar a rota para os escavadores de Mobile Suits.",
                "objectives": [
                    {"id": "obj-14", "text": "Desative os três geradores de energia de Fort Medea."},
                    {"id": "obj-15", "text": "Confronte o Esquadrão Dom da vanguarda inimiga."},
                    {"id": "obj-16", "text": "Encontre o sábio escavador na Cidade dos Diggings para desbloquear o RX-78 Gundam."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-fm-1", "location": "Fort Medea - Subsolo", "item": "Giant Bazooka", "opened": False},
                    {"id": "ch-fm-2", "location": "Fort Medea - Torre de Controle", "item": "Chobham Composite Armor", "opened": False}
                ],
                "boss": {
                    "name": "Trio Dom Black Tri-Stars",
                    "hp": 4500,
                    "weakness": "Beam / High Pierce",
                    "danger_attacks": ["Jet Stream Attack (Ataque Triplo em Linha)", "Spread Beam Blind"],
                    "strategy": "Espalhe o seu time para evitar que o Jet Stream Attack acerte todos de uma vez. Foque todo o poder de fogo em um Dom por vez para quebrar a formação."
                }
            }
        ]
    },
    {
        "id": "act-3",
        "title": "Ato 3: O Império Neo Zarth & O Canyon de Jade",
        "region": "Ásia",
        "chapters": [
            {
                "id": "ch-5-jade-canyon",
                "title": "Capítulo 5: A Travessia do Canyon de Jade",
                "location": "Jade Canyon -> Fortaleza Neo Zarth",
                "summary": "No coração da Ásia, o império militar Neo Zarth prepara o disparo de sua superarma de aniquilação orbital. O grupo se une a Gavane e Li Fang.",
                "objectives": [
                    {"id": "obj-17", "text": "Atravesse o labirinto de pontes suspensas do Canyon de Jade."},
                    {"id": "obj-18", "text": "Destrua o canhão de partículas montado na encosta da montanha."},
                    {"id": "obj-19", "text": "Descubra a cápsula secreta contendo os dados do Zeta Gundam."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-jc-1", "location": "Canyon de Jade - Caverna Leste", "item": "Double Beam Rifle", "opened": False},
                    {"id": "ch-jc-2", "location": "Plataforma do Canhão", "item": "Bio-Sensor Unit", "opened": False}
                ],
                "boss": {
                    "name": "Marasai Custom & Qubeley Prototype",
                    "hp": 6200,
                    "weakness": "Physical Impact / Heavy Explosive",
                    "danger_attacks": ["Remote Funnel Swarm", "Fedayeen Rifle Snipe"],
                    "strategy": "Ative o Mind Field de Aeon imediatamente para anular o bombardeio de feixes e use Gavane com canhões pesados para quebrar a blindagem do Marasai."
                }
            }
        ]
    },
    {
        "id": "act-4",
        "title": "Ato 4: A Fortaleza Celestial & A Órbita Lunar",
        "region": "Espaço / Fortaleza Voadora",
        "chapters": [
            {
                "id": "ch-6-sky-fortress",
                "title": "Capítulo 6: Invasão da Sky Fortress",
                "location": "Sky Fortress & Moon Ark",
                "summary": "A batalha ascende aos céus. Tristan lidera o ataque final à colossal Sky Fortress para desativar o reator principal antes que a Terra seja devastada.",
                "objectives": [
                    {"id": "obj-20", "text": "Suba no elevador orbital e invada a ala de comando da Sky Fortress."},
                    {"id": "obj-21", "text": "Desative os escudos I-Field que protegem o núcleo central."},
                    {"id": "obj-22", "text": "Confronte o General Gabriel e seu Mobile Suit Supremo Sazabi."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-sf-1", "location": "Hangar Principal Sky Fortress", "item": "Beam Scythe Mk-III", "opened": False},
                    {"id": "ch-sf-2", "location": "Câmara do Reator", "item": "Psycommu Resonance Frame", "opened": False}
                ],
                "boss": {
                    "name": "General Gabriel (Sazabi Custom)",
                    "hp": 9800,
                    "weakness": "Hyper Beam / Critical Melee",
                    "danger_attacks": ["Mega Particle Blast", "Heavy Funnel Barrage", "Saber Dash"],
                    "strategy": "O chefe tem altíssima evasão e armadura reforçada. Use Tristan com o Shining Finger ou Zeta Hyper Mega Launcher no momento em que ele recarregar EN."
                }
            }
        ]
    },
    {
        "id": "act-5",
        "title": "Ato 5: Pós-Jogo, Desafios Ocultos & O Devil Gundam",
        "region": "Área Secreta / Núcleo do G-System",
        "chapters": [
            {
                "id": "ch-7-postgame",
                "title": "Capítulo Especial: As Ruínas Perdidas & Ghost Zaku",
                "location": "Dungeon Secreta de Fim de Jogo",
                "summary": "Após salvar o mundo, uma fenda dimensional no G-System revela os protótipos corrompidos mais temidos do universo: o lendário Ghost Zaku e a manifestação do Devil Gundam.",
                "objectives": [
                    {"id": "obj-23", "text": "Derrote os 5 guardiões espectrais nos andares inferiores da Dungeon Extra."},
                    {"id": "obj-24", "text": "Vença o combate contra o temido Ghost Zaku para obter a Master Halberd."},
                    {"id": "obj-25", "text": "Derrote o Devil Gundam em sua forma final para atingir 100% de conclusão."}
                ],
                "missable_ids": [],
                "chests": [
                    {"id": "ch-pg-1", "location": "Andar Subterrâneo 5", "item": "Dark Energy Core", "opened": False},
                    {"id": "ch-pg-2", "location": "Câmara Secreta do Trono", "item": "God Finger Manual", "opened": False}
                ],
                "boss": {
                    "name": "Devil Gundam (Dark Gundam) Final",
                    "hp": 25000,
                    "weakness": "Nenhuma (Imune a debuffs simples)",
                    "danger_attacks": ["DG Cells Regeneration (Cura 2000 HP por rodada)", "Grand Master Storm", "Apocalypse Beam"],
                    "strategy": "Esta é a batalha mais desafiadora de todo o jogo. Requer Mobile Suits no nível máximo com armadura de Chobham, propulsores extras e uso coordenado de Boost Attacks de área de Fritz, Tristan e Aeon para superar a regeneração contínua de HP."
                }
            }
        ]
    }
]

with open("extractor/data/walkthrough.json", "w", encoding="utf-8") as f:
    json.dump(full_walkthrough, f, indent=2, ensure_ascii=False)
print("Saved expanded extractor/data/walkthrough.json")

shutil.copy("extractor/data/walkthrough.json", "companion/src/data/walkthrough.json")
print("Copied expanded walkthrough to companion/src/data/")
