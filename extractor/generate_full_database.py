import json
import os
import shutil

os.makedirs("extractor/data", exist_ok=True)

# 1. COMPREHENSIVE MOBILE SUITS DATABASE
mobilesuits = [
    {
        "id": "zaku-i",
        "name": "Zaku I",
        "model_number": "MS-05B",
        "faction": "Zeon / Inicial",
        "type": "Early Light Mecha",
        "base_hp": 850,
        "base_en": 4,
        "speed": "Normal",
        "grid_size": "4x5",
        "obtain": "Disponível no início do jogo (Prólogo)",
        "description": "Mobile Suit veterano com blindagem leve. Excelente para o início, com baixo consumo de energia.",
        "compatible_roles": ["Melee", "Light Gunner"]
    },
    {
        "id": "zaku-ii",
        "name": "Zaku II",
        "model_number": "MS-06F",
        "faction": "Zeon",
        "type": "Standard Mass Production",
        "base_hp": 1200,
        "base_en": 5,
        "speed": "Normal",
        "grid_size": "4x6",
        "obtain": "Produção no G-System 01 (Mt. Heidi) ou drop de patrulhas",
        "description": "O símbolo das forças de Zeon. Robusto e altamente versátil para armamentos físicos como machados de calor e metralhadoras.",
        "compatible_roles": ["All-Round", "Assault"]
    },
    {
        "id": "gm",
        "name": "GM",
        "model_number": "RGM-79",
        "faction": "Federação da Terra",
        "type": "Mass Production Federation",
        "base_hp": 1100,
        "base_en": 6,
        "speed": "Fast",
        "grid_size": "4x6",
        "obtain": "G-System 01 após resgatar Aeon",
        "description": "Primeiro Mobile Suit de produção em massa da Federação. Ótima afinidade com armas de feixe compactas (Beam Spray Gun).",
        "compatible_roles": ["Beam Gunner", "Skirmisher"]
    },
    {
        "id": "guncannon",
        "name": "Guncannon",
        "model_number": "RX-77-2",
        "faction": "Federação da Terra",
        "type": "Heavy Artillery",
        "base_hp": 1850,
        "base_en": 6,
        "speed": "Slow",
        "grid_size": "5x6",
        "obtain": "Eisengrad - Projeto especial da fábrica militar",
        "description": "Blindagem pesada de liga de titânio e dois canhões de 240mm nos ombros. Ideal para Gavane ou Fritz dispararem artilharia de suporte.",
        "compatible_roles": ["Heavy Artillery", "Tank"]
    },
    {
        "id": "gouf",
        "name": "Gouf",
        "model_number": "MS-07B",
        "faction": "Zeon / Especialista",
        "type": "Close Combat Specialist",
        "base_hp": 1600,
        "base_en": 6,
        "speed": "Fast",
        "grid_size": "5x6",
        "obtain": "Derrote o chefe Vallas em Wyvern Ravine e desbloqueie o blueprint",
        "description": "Especialista letal em combate corpo-a-corpo. Vem equipado nativamente com Heat Rod para eletrocutar inimigos.",
        "compatible_roles": ["Melee Duelist", "Crowd Control"]
    },
    {
        "id": "dom",
        "name": "Dom",
        "model_number": "MS-09",
        "faction": "Zeon",
        "type": "Heavy Hovercraft Mecha",
        "base_hp": 2100,
        "base_en": 7,
        "speed": "High Hover",
        "grid_size": "5x7",
        "obtain": "América do Norte - Território dos Diggings",
        "description": "Movimenta-se deslizando sobre jatos térmicos. Excelente estabilidade para empunhar a Giant Bazooka e sabres pesados.",
        "compatible_roles": ["Bazooka Raider", "Breaker"]
    },
    {
        "id": "rx-78-gundam",
        "name": "RX-78-2 Gundam",
        "model_number": "RX-78-2",
        "faction": "Federação da Terra",
        "type": "Legendary Prototype",
        "base_hp": 2600,
        "base_en": 8,
        "speed": "Very Fast",
        "grid_size": "6x7",
        "obtain": "G-System 02 no continente americano após completar a missão de Tremmie",
        "description": "O lendário 'Demônio Branco'. Armadura de liga Lunar Titanium e afinidade imbatível com Beam Rifle e Beam Sabers de alta potência.",
        "compatible_roles": ["Ace Pilot", "Hybrid Striker"]
    },
    {
        "id": "zeta-gundam",
        "name": "Zeta Gundam",
        "model_number": "MSZ-006",
        "faction": "AEUG",
        "type": "Transformable High-Spec",
        "base_hp": 3400,
        "base_en": 9,
        "speed": "Maximum",
        "grid_size": "6x8",
        "obtain": "G-System 03 (Ásia) com Bio-Sensor Data",
        "description": "Equipado com o Bio-Sensor de nova geração. Sincroniza excepcionalmente com os poderes psíquicos de Aeon ou reflexos de Tristan.",
        "compatible_roles": ["Newtype Ace", "Hyper Sniper"]
    },
    {
        "id": "qubeley",
        "name": "Qubeley",
        "model_number": "AMX-004",
        "faction": "Neo Zeon",
        "type": "Psycommu / Funnel Platform",
        "base_hp": 3200,
        "base_en": 10,
        "speed": "High",
        "grid_size": "6x8",
        "obtain": "QG Secreto de Neo Zarth / Drop de Chefe Feminina",
        "description": "Design orgânico elegante com dois casulos de ombro contendo 12 Funnels guiados pela mente do piloto.",
        "compatible_roles": ["Funnel Master", "Area Disruption"]
    },
    {
        "id": "sazabi",
        "name": "Sazabi",
        "model_number": "MSN-04",
        "faction": "Neo Zeon Comandante",
        "type": "Heavy Supreme Commander",
        "base_hp": 4600,
        "base_en": 10,
        "speed": "Fast",
        "grid_size": "7x9",
        "obtain": "Base Espacial Final (G-System Especial)",
        "description": "Poder esmagador em blindagem vermelha. Combina Funnels de grande porte, Beam Shotrifle e o Mega Particle Cannon no torso.",
        "compatible_roles": ["Ultimate Heavy Striker", "Supreme Tank"]
    },
    {
        "id": "shining-gundam",
        "name": "Shining Gundam",
        "model_number": "GF13-017NJ",
        "faction": "Neo Japan / Mobile Fighter",
        "type": "Martial Arts Striker",
        "base_hp": 3800,
        "base_en": 9,
        "speed": "Ultra",
        "grid_size": "6x8",
        "obtain": "Dungeon Oculta da Ásia Oriental / Coliseu Secreto",
        "description": "Mobile Fighter construído para combate marcial puro. Executa o lendário Shining Finger quando atinge o Super Mode.",
        "compatible_roles": ["Melee God", "Burst Finisher"]
    },
    {
        "id": "deathscythe",
        "name": "Gundam Deathscythe",
        "model_number": "XXXG-01D",
        "faction": "Colônias Espaciais",
        "type": "Stealth Reaper",
        "base_hp": 3500,
        "base_en": 8,
        "speed": "Maximum",
        "grid_size": "6x8",
        "obtain": "Recompensa por completar os desafios da Sky Fortress",
        "description": "Equipado com Hyper Jammer para ficar invisível nos radares inimigos e Beam Scythe para decapitar esquadrões inteiros.",
        "compatible_roles": ["Stealth Assassin", "Critical Striker"]
    }
]

with open("extractor/data/mobilesuits.json", "w", encoding="utf-8") as f:
    json.dump(mobilesuits, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/mobilesuits.json")

# 2. WEAPONS DATABASE
weapons = [
    {
        "id": "beam-saber",
        "name": "Beam Saber",
        "category": "Melee (Corpo-a-corpo)",
        "damage": 320,
        "type": "Beam / Energy",
        "en_cost": 1,
        "grid": "1x3",
        "obtain": "Oficinas de Marie Foley / Padrão GM",
        "description": "Lâmina de plasma contida por campo magnético. Ignora armaduras físicas pesadas."
    },
    {
        "id": "heat-hawk",
        "name": "Heat Hawk",
        "category": "Melee (Corpo-a-corpo)",
        "damage": 290,
        "type": "Physical / Thermal",
        "en_cost": 1,
        "grid": "2x2",
        "obtain": "Padrão Zaku I e Zaku II",
        "description": "Machado térmico com lâmina superaquecida. Causa dano físico consistente a baixo custo."
    },
    {
        "id": "beam-scythe",
        "name": "Beam Scythe",
        "category": "Melee (Corpo-a-corpo)",
        "damage": 880,
        "type": "Beam / Energy",
        "en_cost": 3,
        "grid": "2x4",
        "obtain": "Arma do Gundam Deathscythe",
        "description": "Foice de energia colossal com altíssima taxa de acerto crítico e efeito de varredura."
    },
    {
        "id": "impact-lance",
        "name": "Impact Lance",
        "category": "Melee (Perfurante)",
        "damage": 520,
        "type": "Physical / Pierce",
        "en_cost": 2,
        "grid": "1x4",
        "obtain": "Wyvern Ravine - Sala do Chefe (MISSABLE!)",
        "description": "Lança de impacto cinética. Causa dano massivo em linha reta e quebra escudos de concreto."
    },
    {
        "id": "zaku-machine-gun",
        "name": "120mm Zaku Machine Gun",
        "category": "Ranged (Projétil)",
        "damage": 240,
        "type": "Physical / Solid",
        "en_cost": 1,
        "grid": "2x3",
        "obtain": "Lojas de Marie Foley / Zakus",
        "description": "Dispara rajadas rápidas de 120mm com munição tambor. Alta taxa de acertos."
    },
    {
        "id": "beam-rifle",
        "name": "Beam Rifle (RX-78)",
        "category": "Ranged (Feixe)",
        "damage": 650,
        "type": "Beam / Energy",
        "en_cost": 2,
        "grid": "2x4",
        "obtain": "Desbloqueado com o RX-78 Gundam",
        "description": "Poder de fogo comparável ao canhão de um encouraçado estelar. Excelente precisão."
    },
    {
        "id": "giant-bazooka",
        "name": "Giant Bazooka (360mm)",
        "category": "Heavy (Explosivo)",
        "damage": 780,
        "type": "Physical / Explosive",
        "en_cost": 3,
        "grid": "2x5",
        "obtain": "Equipamento original do Dom / Lojas dos Diggings",
        "description": "Munição pesada explosiva de 360mm capaz de causar dano em área com efeito de atordoamento."
    },
    {
        "id": "gatling-shield",
        "name": "Gatling Shield",
        "category": "Hybrid (Escudo & Arma)",
        "damage": 580,
        "type": "Physical / Rapid",
        "en_cost": 2,
        "grid": "3x4",
        "obtain": "Wyvern Ravine (Drop raro ou Gouf Custom)",
        "description": "Escudo defensivo reforçado com canhão Gatling multicanos de 75mm embutido."
    },
    {
        "id": "funnel-rack",
        "name": "Funnel Container System",
        "category": "Psycommu (Psíquico)",
        "damage": 920,
        "type": "Remote / All-Range",
        "en_cost": 4,
        "grid": "3x3",
        "obtain": "Ruínas de Neo Zarth / G-System 03",
        "description": "Módulos de ataque sem fio teleguiados. Disparam contra todos os alvos ignorando defesas normais."
    }
]

with open("extractor/data/weapons.json", "w", encoding="utf-8") as f:
    json.dump(weapons, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/weapons.json")

# 3. OPTION PARTS DATABASE
options = [
    {
        "id": "high-speed-booster",
        "name": "High Speed Booster",
        "category": "Mobility",
        "effect": "Aumenta a velocidade e iniciativa de combate em +25%.",
        "grid": "2x2",
        "obtain": "Baú em Tohai ou Oficina de Eisengrad"
    },
    {
        "id": "titanium-armor-plate",
        "name": "Titanium Armor Plate",
        "category": "Defense",
        "effect": "Aumenta a blindagem física em +180 e HP máximo em +400.",
        "grid": "2x3",
        "obtain": "Lojas de Eisengrad"
    },
    {
        "id": "chobham-armor",
        "name": "Chobham Composite Armor",
        "category": "Defense",
        "effect": "Aumenta HP em +800 e reduz dano de explosões em 30%.",
        "grid": "3x3",
        "obtain": "Diggings - América do Norte"
    },
    {
        "id": "extra-propellant-tank",
        "name": "Extra Propellant Tank",
        "category": "Energy",
        "effect": "Aumenta a capacidade de energia do Mobile Suit em +2 EN por turno.",
        "grid": "1x3",
        "obtain": "Oficinas espaciais e G-System 02"
    },
    {
        "id": "medical-bay-unit",
        "name": "Field Medical Bay",
        "category": "Support",
        "effect": "Recupera automaticamente 15% do HP do robô no final de cada rodada.",
        "grid": "2x3",
        "obtain": "Recompensa de quest secundária em Marie Foley"
    },
    {
        "id": "psycommu-frame",
        "name": "Psycommu Resonance Frame",
        "category": "Special",
        "effect": "Permite que pilotos Newtype (Aeon / Lapis) causem +40% de dano com Funnels e Beam Weapons.",
        "grid": "2x2",
        "obtain": "Laboratório de Neo Zarth"
    },
    {
        "id": "death-cloak",
        "name": "Death Cloak Device",
        "category": "Stealth",
        "effect": "Concede 50% de chance de esquiva nos primeiros 2 turnos da batalha.",
        "grid": "2x2",
        "obtain": "Sky Fortress - Sala Secreta"
    }
]

with open("extractor/data/options.json", "w", encoding="utf-8") as f:
    json.dump(options, f, indent=2, ensure_ascii=False)
print("Saved extractor/data/options.json")

# Copy everything to companion/src/data/
for f_name in ["mobilesuits.json", "weapons.json", "options.json"]:
    shutil.copy(f"extractor/data/{f_name}", f"companion/src/data/{f_name}")
print("Copied all new datasets to companion/src/data/")
