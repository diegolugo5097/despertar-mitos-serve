// server.js — Colombia Ancestral RPG Multiplayer (Historia + Votación + Combate)
// ============================================================================
// Dependencias: npm i express socket.io cors nanoid
// Node 18+ (fs y path son nativas)

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { customAlphabet } = require("nanoid");
const fs = require("fs");
const path = require("path");

// ===================== Config básica =====================
const PORT = process.env.PORT || 4000;
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ===================== Historia dinámica =====================
const STORY_PATH = path.join(__dirname, "data", "story.json");
let STORY = { capitulos: [] };
try {
  STORY = JSON.parse(fs.readFileSync(STORY_PATH, "utf-8"));
} catch (e) {
  console.warn("⚠️ No se encontró data/story.json. Carga básica sin historia.");
}

// ===================== Datos de Héroes y Bosses =====================
// 6 HÉROES JUGABLES (únicos por sala)
const HEROES = [
  {
    id: "caribe",
    name: "Aurelio 'El Guaracha'",
    region: "Caribe",
    base: { hp: 120, attack: 35, defense: 20, speed: 30, mana: 50 },
    abilities: [
      {
        id: "danza",
        name: "Danza del Caribe",
        type: "buff",
        effect: { speed: +10 },
        duration: 2,
        cd: 2,
        mana: 10,
      },
      {
        id: "rafaga",
        name: "Ráfaga Salobre",
        type: "magic",
        power: 30,
        cd: 1,
        mana: 10,
      },
      {
        id: "grito",
        name: "Grito de Batalla",
        type: "debuff",
        effect: { defense: -10 },
        duration: 2,
        cd: 2,
        mana: 10,
      },
      {
        id: "canon",
        name: "Cañonazo Pirata",
        type: "ultimate",
        power: 80,
        cd: 3,
        mana: 25,
      },
    ],
  },
  {
    id: "andina",
    name: "Salvador 'El Cóndor'",
    region: "Andina",
    base: { hp: 150, attack: 40, defense: 30, speed: 20, mana: 45 },
    abilities: [
      {
        id: "lanza",
        name: "Lanza de Chibchacum",
        type: "physical",
        power: 35,
        cd: 0,
        mana: 0,
      },
      {
        id: "muralla",
        name: "Muralla de Sal",
        type: "buff",
        effect: { defense: +15 },
        duration: 2,
        cd: 2,
        mana: 10,
      },
      {
        id: "bendicion",
        name: "Bendición del Cóndor",
        type: "heal",
        power: 30,
        cd: 2,
        mana: 15,
      },
      {
        id: "colera",
        name: "Cólera del Altiplano",
        type: "ultimate",
        power: 85,
        cd: 3,
        mana: 25,
      },
    ],
  },
  {
    id: "pacifica",
    name: "Nayara 'La Selva'",
    region: "Pacífica",
    base: { hp: 100, attack: 25, defense: 25, speed: 35, mana: 70 },
    abilities: [
      {
        id: "tambores",
        name: "Tambores del Manglar",
        type: "buff",
        effect: { speed: +10 },
        duration: 2,
        cd: 2,
        mana: 12,
      },
      {
        id: "maldicion",
        name: "Maldición de la Tunda",
        type: "debuff",
        effect: { attack: -10 },
        duration: 2,
        cd: 2,
        mana: 12,
      },
      {
        id: "oleada",
        name: "Oleada Pacífica",
        type: "magic",
        power: 28,
        cd: 1,
        mana: 10,
      },
      {
        id: "alianza",
        name: "Alianza Ancestral",
        type: "summon",
        power: 20,
        duration: 3,
        cd: 3,
        mana: 25,
      },
    ],
  },
  {
    id: "amazonica",
    name: "Kairú 'El Verde'",
    region: "Amazónica",
    base: { hp: 120, attack: 35, defense: 20, speed: 25, mana: 80 },
    abilities: [
      {
        id: "curupira",
        name: "Llamado del Curupira",
        type: "physical",
        power: 32,
        cd: 0,
        mana: 0,
      },
      {
        id: "yage",
        name: "Velo de Yagé",
        type: "buff",
        effect: { defense: +10, speed: +5 },
        duration: 2,
        cd: 2,
        mana: 12,
      },
      {
        id: "anaconda",
        name: "Aliento de Anaconda",
        type: "magic",
        power: 24,
        dot: { poison: 6 },
        duration: 2,
        cd: 2,
        mana: 14,
      },
      {
        id: "yurupari",
        name: "Cólera de Yuruparí",
        type: "ultimate",
        power: 70,
        root: 1,
        cd: 3,
        mana: 26,
      },
    ],
  },
  {
    id: "orinoquia",
    name: "Ramiro 'El Llanero'",
    region: "Orinoquía",
    base: { hp: 140, attack: 45, defense: 25, speed: 40, mana: 50 },
    abilities: [
      {
        id: "lanza_relinchante",
        name: "Lanza Relinchante",
        type: "physical",
        power: 36,
        cd: 0,
        mana: 0,
      },
      {
        id: "furia",
        name: "Furia Llanera",
        type: "buff",
        effect: { attack: +10 },
        duration: 2,
        cd: 2,
        mana: 10,
      },
      {
        id: "galope",
        name: "Galope Fantasmal",
        type: "magic",
        power: 26,
        cd: 1,
        mana: 10,
      },
      {
        id: "silbon",
        name: "Espíritu del Silbón",
        type: "ultimate",
        power: 75,
        fear: 1,
        cd: 3,
        mana: 22,
      },
    ],
  },
  {
    id: "insular",
    name: "Selene 'La Marea'",
    region: "Insular",
    base: { hp: 105, attack: 30, defense: 20, speed: 35, mana: 75 },
    abilities: [
      {
        id: "marea",
        name: "Marea Alta",
        type: "magic",
        power: 27,
        cd: 1,
        mana: 10,
      },
      {
        id: "sirena",
        name: "Canto de Sirena",
        type: "debuff",
        effect: { accuracy: -5 },
        duration: 2,
        cd: 2,
        mana: 12,
      },
      {
        id: "coral",
        name: "Bendición del Coral",
        type: "heal_single",
        power: 45,
        cd: 2,
        mana: 16,
      },
      {
        id: "kraken",
        name: "Ira del Kraken",
        type: "ultimate",
        power: 78,
        cd: 3,
        mana: 24,
      },
    ],
  },
];

// Jefes y villanos por región (IDs deben coincidir con story.json)
const BOSSES = [
  // Caribe
  {
    id: "hombre_caiman",
    region: "Caribe",
    name: "Hombre Caimán",
    base: { hp: 220, attack: 40, defense: 22, speed: 26 },
    abilities: [
      { id: "mordida", name: "Mordida del Río", type: "physical", power: 30 },
      {
        id: "cola",
        name: "Latigazo de Cola",
        type: "physical",
        power: 26,
        knock: 1,
      },
      {
        id: "fangoso",
        name: "Arrastre Fangoso",
        type: "magic",
        power: 24,
        root: 1,
      },
      {
        id: "frenesi",
        name: "Frenesí del Delta",
        type: "ultimate",
        power: 80,
        cd: 3,
      },
    ],
  },
  {
    id: "madremonte",
    region: "Caribe",
    name: "Madremonte",
    base: { hp: 230, attack: 38, defense: 28, speed: 18 },
    abilities: [
      {
        id: "enredadera",
        name: "Enredaderas Vivas",
        type: "magic",
        power: 28,
        root: 1,
      },
      {
        id: "bruma",
        name: "Bruma del Bosque",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      { id: "golpe", name: "Golpe de Tronco", type: "physical", power: 32 },
      {
        id: "ira_selva",
        name: "Ira de la Selva",
        type: "ultimate",
        power: 82,
        cd: 3,
      },
    ],
  },
  {
    id: "llorona",
    region: "Caribe",
    name: "La Llorona",
    base: { hp: 260, attack: 45, defense: 25, speed: 20 },
    abilities: [
      { id: "grito", name: "Grito de las Almas", type: "magic", power: 34 },
      {
        id: "maldicion_hijos",
        name: "Maldición de los Hijos",
        type: "debuff",
        effect: { attack: -10 },
        duration: 2,
      },
      {
        id: "almas",
        name: "Invocar Almas en Pena",
        type: "summon",
        power: 18,
        duration: 2,
      },
      {
        id: "tormenta",
        name: "Tormenta de Lamentos",
        type: "ultimate",
        power: 88,
        cd: 3,
      },
    ],
  },
  // Andina
  {
    id: "patasola",
    region: "Andina",
    name: "La Patasola",
    base: { hp: 210, attack: 42, defense: 22, speed: 30 },
    abilities: [
      {
        id: "garra",
        name: "Garra Salvaje",
        type: "physical",
        power: 32,
        bleed: 6,
        duration: 2,
      },
      {
        id: "alucin",
        name: "Alucinación Nocturna",
        type: "debuff",
        effect: { defense: -10 },
        duration: 2,
      },
      { id: "grito", name: "Grito de Selva", type: "magic", power: 24 },
      {
        id: "furia",
        name: "Furia de la Montaña",
        type: "ultimate",
        power: 82,
        cd: 3,
      },
    ],
  },
  {
    id: "sombreron",
    region: "Andina",
    name: "El Sombrerón",
    base: { hp: 220, attack: 36, defense: 24, speed: 28 },
    abilities: [
      {
        id: "sombras",
        name: "Sombras Errantes",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      {
        id: "cuerda",
        name: "Cuerda Encantada",
        type: "magic",
        power: 26,
        root: 1,
      },
      { id: "latigo", name: "Látigo de Sombras", type: "physical", power: 30 },
      {
        id: "noche",
        name: "Noche del Altiplano",
        type: "ultimate",
        power: 84,
        cd: 3,
      },
    ],
  },
  {
    id: "mohan",
    region: "Andina",
    name: "El Mohán",
    base: { hp: 300, attack: 50, defense: 30, speed: 18 },
    abilities: [
      { id: "marea", name: "Marea Negra", type: "magic", power: 36 },
      {
        id: "oro",
        name: "Canto del Oro",
        type: "debuff",
        effect: { defense: -12 },
        duration: 2,
      },
      {
        id: "arrastre",
        name: "Arrastre del Río",
        type: "physical",
        power: 32,
        root: 1,
      },
      {
        id: "diluvio",
        name: "Diluvio Ancestral",
        type: "ultimate",
        power: 92,
        cd: 3,
      },
    ],
  },
  // Pacífica (intermedios + final Tunda)
  {
    id: "buziraco",
    region: "Pacífica",
    name: "Buziraco",
    base: { hp: 210, attack: 39, defense: 22, speed: 29 },
    abilities: [
      {
        id: "blasfemia",
        name: "Blasfemia",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      { id: "zarpazo", name: "Zarpazo de Tejado", type: "physical", power: 30 },
      { id: "eco", name: "Eco Maldito", type: "magic", power: 26 },
      {
        id: "oscuridad",
        name: "Oscuridad de San Antonio",
        type: "ultimate",
        power: 80,
        cd: 3,
      },
    ],
  },
  {
    id: "duende_rio",
    region: "Pacífica",
    name: "Duende del Río",
    base: { hp: 200, attack: 34, defense: 20, speed: 33 },
    abilities: [
      {
        id: "engaño",
        name: "Engaño del Agua",
        type: "debuff",
        effect: { defense: -8 },
        duration: 2,
      },
      { id: "ahogo", name: "Ahogo", type: "magic", power: 28, root: 1 },
      { id: "piedra", name: "Piedra de Río", type: "physical", power: 26 },
      {
        id: "remolino",
        name: "Remolino Embrujado",
        type: "ultimate",
        power: 78,
        cd: 3,
      },
    ],
  },
  {
    id: "tunda",
    region: "Pacífica",
    name: "La Tunda",
    base: { hp: 240, attack: 40, defense: 22, speed: 28 },
    abilities: [
      {
        id: "cebo",
        name: "Cebo de Cangrejo",
        type: "debuff",
        effect: { speed: -8 },
        duration: 2,
      },
      { id: "garra", name: "Garra de Manglar", type: "physical", power: 34 },
      {
        id: "encanto",
        name: "Encanto Sombrío",
        type: "magic",
        power: 26,
        fear: 1,
      },
      {
        id: "huracan",
        name: "Huracán de Selvas",
        type: "ultimate",
        power: 85,
        cd: 3,
      },
    ],
  },
  // Amazónica
  {
    id: "mapinguari",
    region: "Amazónica",
    name: "Mapinguarí",
    base: { hp: 260, attack: 44, defense: 30, speed: 18 },
    abilities: [
      {
        id: "rugido",
        name: "Rugido Pútrido",
        type: "debuff",
        effect: { attack: -10 },
        duration: 2,
      },
      {
        id: "zarpazo",
        name: "Zarpazo del Bosque",
        type: "physical",
        power: 34,
      },
      {
        id: "putrefaccion",
        name: "Putrefacción",
        type: "magic",
        power: 24,
        bleed: 6,
        duration: 2,
      },
      {
        id: "desgarro",
        name: "Desgarro Selvático",
        type: "ultimate",
        power: 90,
        cd: 3,
      },
    ],
  },
  {
    id: "boraro",
    region: "Amazónica",
    name: "Boraro",
    base: { hp: 240, attack: 42, defense: 24, speed: 24 },
    abilities: [
      {
        id: "silbido",
        name: "Silbido del Monte",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      { id: "lanza", name: "Lanza de Palma", type: "physical", power: 32 },
      {
        id: "resina",
        name: "Resina Pegajosa",
        type: "magic",
        power: 22,
        root: 1,
      },
      {
        id: "caceria",
        name: "Cacería Tribal",
        type: "ultimate",
        power: 84,
        cd: 3,
      },
    ],
  },
  {
    id: "yurupari",
    region: "Amazónica",
    name: "Yuruparí",
    base: { hp: 320, attack: 48, defense: 28, speed: 22 },
    abilities: [
      {
        id: "lianas",
        name: "Lianas Sagradas",
        type: "magic",
        power: 30,
        root: 1,
      },
      { id: "espinas", name: "Espinas de Ceiba", type: "physical", power: 36 },
      {
        id: "selva_viva",
        name: "Selva Viva",
        type: "summon",
        power: 20,
        duration: 3,
      },
      {
        id: "juicio",
        name: "Juicio de la Selva",
        type: "ultimate",
        power: 90,
        cd: 3,
      },
    ],
  },
  // Orinoquía
  {
    id: "bola_fuego",
    region: "Orinoquía",
    name: "Bola de Fuego",
    base: { hp: 210, attack: 40, defense: 20, speed: 36 },
    abilities: [
      { id: "chispazo", name: "Chispazo", type: "magic", power: 28 },
      {
        id: "incendio",
        name: "Incendio Llanero",
        type: "magic",
        power: 30,
        knock: 1,
      },
      {
        id: "quemadura",
        name: "Quemadura",
        type: "debuff",
        effect: { defense: -8 },
        duration: 2,
      },
      {
        id: "tormenta_fuego",
        name: "Tormenta de Fuego",
        type: "ultimate",
        power: 86,
        cd: 3,
      },
    ],
  },
  {
    id: "sayona",
    region: "Orinoquía",
    name: "La Sayona",
    base: { hp: 230, attack: 43, defense: 24, speed: 32 },
    abilities: [
      {
        id: "aliento",
        name: "Aliento Maldito",
        type: "debuff",
        effect: { attack: -10 },
        duration: 2,
      },
      {
        id: "garfio",
        name: "Garfio de Ultratumba",
        type: "physical",
        power: 32,
      },
      {
        id: "espectro",
        name: "Espectro Nocturno",
        type: "magic",
        power: 28,
        fear: 1,
      },
      {
        id: "venganza",
        name: "Venganza de la Llanura",
        type: "ultimate",
        power: 88,
        cd: 3,
      },
    ],
  },
  {
    id: "silbon",
    region: "Orinoquía",
    name: "El Silbón",
    base: { hp: 250, attack: 46, defense: 24, speed: 34 },
    abilities: [
      {
        id: "silbo",
        name: "Silbo de la Muerte",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      {
        id: "saco",
        name: "Saco de Huesos",
        type: "physical",
        power: 32,
        bleed: 6,
        duration: 2,
      },
      {
        id: "jinete",
        name: "Jinetes Sin Cabeza",
        type: "summon",
        power: 22,
        duration: 2,
      },
      {
        id: "noche",
        name: "Noche Llanera",
        type: "ultimate",
        power: 84,
        cd: 3,
      },
    ],
  },
  // Insular
  {
    id: "pirata_fantasma",
    region: "Insular",
    name: "Pirata Fantasma",
    base: { hp: 220, attack: 38, defense: 22, speed: 30 },
    abilities: [
      { id: "sable", name: "Sable Espectral", type: "physical", power: 32 },
      {
        id: "ron",
        name: "Niebla de Ron",
        type: "debuff",
        effect: { accuracy: -6 },
        duration: 2,
      },
      { id: "cañon", name: "Cañón Ecto", type: "magic", power: 28, knock: 1 },
      {
        id: "abordaje",
        name: "Abordaje Fantasmal",
        type: "ultimate",
        power: 82,
        cd: 3,
      },
    ],
  },
  {
    id: "sirena",
    region: "Insular",
    name: "Sirena de San Andrés",
    base: { hp: 210, attack: 36, defense: 24, speed: 34 },
    abilities: [
      {
        id: "canto",
        name: "Canto Hipnótico",
        type: "debuff",
        effect: { speed: -8 },
        duration: 2,
      },
      { id: "lazo", name: "Lazo de Coral", type: "magic", power: 26, root: 1 },
      { id: "torbellino", name: "Torbellino Azul", type: "magic", power: 28 },
      {
        id: "mares",
        name: "Mares Antiguos",
        type: "ultimate",
        power: 80,
        cd: 3,
      },
    ],
  },
  {
    id: "kraken",
    region: "Insular",
    name: "El Kraken",
    base: { hp: 360, attack: 55, defense: 32, speed: 16 },
    abilities: [
      {
        id: "tentaculo",
        name: "Tentáculo Abisal",
        type: "physical",
        power: 38,
      },
      {
        id: "marea",
        name: "Marea Embravecida",
        type: "magic",
        power: 34,
        knock: 1,
      },
      {
        id: "torbellino",
        name: "Torbellino",
        type: "summon",
        power: 24,
        duration: 2,
      },
      {
        id: "tsunami",
        name: "Tsunami Final",
        type: "ultimate",
        power: 100,
        cd: 3,
      },
    ],
  },
];

const HERO_BY_ID = Object.fromEntries(HEROES.map((h) => [h.id, h]));
const BOSS_BY_ID = Object.fromEntries(BOSSES.map((b) => [b.id, b]));

// ===================== Estado en memoria =====================
/**
 * rooms[code] = {
 *  code, hostId, stage, players: { [socketId]: { id, name, heroId, ready, stats, effects, cds, alive } },
 *  selectedHeroes:Set, chapterId, nodeId,
 *  pendingTeamBuffs?: Array<{attack?, defense?, speed?, mana?, duration?}>
 *  activeVote?: { nodeId, options, startedAt, durationMs, votes, timeoutHandle },
 *  battle?: { boss, order[], turnIndex, log[] }
 * }
 */
const rooms = {};

// ===================== Utilidades comunes =====================
const makeRoomCode = () => {
  let c;
  do {
    c = nanoid();
  } while (rooms[c]);
  return c;
};
const getRoomBySocket = (socket) => {
  const joined = [...socket.rooms].filter((r) => r !== socket.id);
  if (!joined.length) return null;
  return rooms[joined[0]] || null;
};
const rollD = (s) => Math.floor(Math.random() * s) + 1;
const rollHeroD20 = () => rollD(20);
const rollVillainPack = () => ({
  d4: [rollD(4), rollD(4)],
  d20: [rollD(20), rollD(20)],
});
const randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
function majorityOption(votes) {
  const tally = {};
  Object.values(votes).forEach((opt) => {
    tally[opt] = (tally[opt] || 0) + 1;
  });
  let winner = null,
    max = -1;
  for (const [k, v] of Object.entries(tally))
    if (v > max) {
      max = v;
      winner = k;
    }
  return { winner, tally };
}

// ===================== Historia Helpers =====================
function getCap(chapterId) {
  return STORY.capitulos.find((c) => c.id === chapterId);
}
function getNode(chapterId, nodeId) {
  return getCap(chapterId)?.nodos?.[nodeId];
}
function getNpcDialogue(chapterId, nodeId) {
  return getNode(chapterId, nodeId)?.dialogos || [];
}

function applyNodeRewards(room, node) {
  if (!node?.recompensa) return;
  const r = node.recompensa;

  // Buff diferido para próxima batalla
  if (r.buff) {
    room.pendingTeamBuffs = room.pendingTeamBuffs || [];
    room.pendingTeamBuffs.push(r.buff);
    io.to(room.code).emit("story:reward", { type: "buff", buff: r.buff });
  }

  // Curación inmediata
  if (typeof r.heal === "number") {
    Object.values(room.players).forEach((p) => {
      if (p.stats)
        p.stats.hp = Math.min(
          HERO_BY_ID[p.heroId]?.base.hp || p.stats.hp,
          p.stats.hp + r.heal
        );
    });
    io.to(room.code).emit("story:reward", { type: "heal", amount: r.heal });
  }

  // Maná inmediato
  if (typeof r.mana === "number") {
    Object.values(room.players).forEach((p) => {
      if (p.stats)
        p.stats.mana = Math.min(
          HERO_BY_ID[p.heroId]?.base.mana || p.stats.mana,
          p.stats.mana + r.mana
        );
    });
    io.to(room.code).emit("story:reward", { type: "mana", amount: r.mana });
  }
}

function emitStoryNode(room) {
  const cap = getCap(room.chapterId);
  const node = getNode(room.chapterId, room.nodeId);
  if (node) applyNodeRewards(room, node);

  io.to(room.code).emit("story:node", {
    chapterId: room.chapterId,
    nodeId: room.nodeId,
    titulo: cap?.titulo,
    narrativa: cap?.narrativa,
    bossId: node?.boss || null,
    npcDialogue: getNpcDialogue(room.chapterId, room.nodeId),
  });
  io.to(room.code).emit("room:update", room);
}

function nextFromOption(room, chosenId) {
  const node = getNode(room.chapterId, room.nodeId);
  if (!node) return;

  if (node.opciones) {
    const opt = node.opciones.find((o) => o.id === chosenId);
    if (!opt) return;

    if (opt.nextCapitulo) {
      room.chapterId = opt.nextCapitulo;
      const nextCap = getCap(room.chapterId);
      room.nodeId = nextCap?.inicio || room.nodeId;
      emitStoryNode(room);
      return;
    }
    if (opt.next) {
      room.nodeId = opt.next;
      emitStoryNode(room);
      return;
    }
  }
}

function maybeAdvanceAfterBoss(room) {
  const node = getNode(room.chapterId, room.nodeId);
  const cap = getCap(room.chapterId);
  if (node?.boss && node.boss === cap?.bossFinal && node?.nextCapitulo) {
    room.chapterId = node.nextCapitulo;
    const nextCap = getCap(room.chapterId);
    room.nodeId = nextCap?.inicio || room.nodeId;
    emitStoryNode(room);
  } else if (node?.next) {
    room.nodeId = node.next;
    emitStoryNode(room);
  }
}

// ===================== Combate: helpers =====================
function initHeroStats(hero) {
  return {
    hp: hero.base.hp,
    attack: hero.base.attack,
    defense: hero.base.defense,
    speed: hero.base.speed,
    mana: hero.base.mana,
  };
}
function abilityById(hero, abilityId) {
  return hero.abilities.find((a) => a.id === abilityId);
}
function getStatWithEffects(base, effects, key) {
  let val = base;
  for (const eff of Object.values(effects || {})) if (eff[key]) val += eff[key];
  return val;
}
function computeHit(attackRoll, attackerAcc = 0, defenderEva = 0) {
  return attackRoll + attackerAcc - defenderEva >= 10;
}
function applyEffectsTick(entity) {
  entity.effects = entity.effects || {};
  const toDelete = [];
  for (const [key, eff] of Object.entries(entity.effects)) {
    if (eff.dot) entity.hp = Math.max(0, entity.hp - eff.dot);
    eff.turnsLeft = (eff.turnsLeft || 0) - 1;
    if (eff.turnsLeft <= 0) toDelete.push(key);
  }
  toDelete.forEach((k) => delete entity.effects[k]);
}
function tickCooldowns(slot) {
  slot.ref.cds = slot.ref.cds || {};
  for (const k of Object.keys(slot.ref.cds)) {
    slot.ref.cds[k] = Math.max(0, slot.ref.cds[k] - 1);
    if (slot.ref.cds[k] === 0) delete slot.ref.cds[k];
  }
}
function startBattle(room, bossId) {
  const base = BOSS_BY_ID[bossId];
  if (!base) return false;
  const boss = {
    id: base.id,
    region: base.region,
    name: base.name,
    hp: base.base.hp,
    attack: base.base.attack,
    defense: base.base.defense,
    speed: base.base.speed,
    abilities: base.abilities,
    cds: {},
    effects: {},
  };
  const heroes = Object.values(room.players)
    .filter((p) => p.heroId)
    .map((p) => ({
      type: "hero",
      ref: {
        socketId: p.id,
        heroId: p.heroId,
        name: HERO_BY_ID[p.heroId].name,
        stats: { ...p.stats },
        cds: {},
        effects: {},
        alive: true,
      },
    }));

  // Aplicar buffs diferidos de historia
  if (room.pendingTeamBuffs?.length) {
    heroes.forEach((h) => {
      room.pendingTeamBuffs.forEach((buff, idx) => {
        h.ref.effects = h.ref.effects || {};
        h.ref.effects[`storyBuff_${idx}`] = {
          ...buff,
          turnsLeft: buff.duration || 2,
        };
      });
    });
    room.pendingTeamBuffs = [];
  }

  const order = [...heroes, { type: "boss", ref: boss }].sort((A, B) => {
    const aS = A.type === "hero" ? A.ref.stats.speed : A.ref.speed;
    const bS = B.type === "hero" ? B.ref.stats.speed : B.ref.speed;
    if (bS !== aS) return bS - aS;
    return rollD(20) - rollD(20); // desempate
  });

  room.battle = { boss, order, turnIndex: 0, log: [] };
  room.stage = "battle";
  return true;
}
function bossChooseAbility(boss) {
  const usable = boss.abilities.filter((a) => !boss.cds[a.id]);
  const ult = usable.find((a) => a.type === "ultimate");
  return (
    ult || (usable.length ? randChoice(usable) : randChoice(boss.abilities))
  );
}
function battleAdvanceTurn(room) {
  const B = room.battle;
  B.turnIndex = (B.turnIndex + 1) % B.order.length;
  // saltar entidades muertas
  let guard = 0;
  while (guard++ < 20) {
    const slot = B.order[B.turnIndex];
    if (slot.type === "hero") {
      if (slot.ref.alive) break;
    } else {
      if (B.boss.hp > 0) break;
    }
    B.turnIndex = (B.turnIndex + 1) % B.order.length;
  }
}
function checkBattleEnd(room) {
  const B = room.battle;
  const heroesAlive = B.order.some((s) => s.type === "hero" && s.ref.alive);
  if (!heroesAlive) return "boss";
  if (B.boss.hp <= 0) return "heroes";
  return null;
}
function endTurnAndTick(room) {
  const B = room.battle;
  // cooldowns del que terminó
  tickCooldowns(B.order[B.turnIndex]);
  // avanzar
  battleAdvanceTurn(room);
  const next = B.order[B.turnIndex];
  // aplicar DOTs al que entra si es héroe
  if (next.type === "hero") {
    applyEffectsTick(next.ref);
    if (next.ref.stats.hp <= 0) next.ref.alive = false;
  }
  io.to(room.code).emit("battle:turn", { turnIndex: B.turnIndex });
}

// ===================== SOCKETS =====================
io.on("connection", (socket) => {
  console.log("🔌 Conectado:", socket.id);

  // Crear sala
  socket.on("room:create", ({ name }, cb) => {
    const code = makeRoomCode();
    const firstCapId = STORY.capitulos[0]?.id || "prologo";
    const firstNodeId = STORY.capitulos[0]?.inicio || "prologo_intro";

    rooms[code] = {
      code,
      hostId: socket.id,
      stage: "lobby",
      players: {},
      selectedHeroes: new Set(),
      chapterId: firstCapId,
      nodeId: firstNodeId,
      pendingTeamBuffs: [],
    };
    socket.join(code);
    rooms[code].players[socket.id] = {
      id: socket.id,
      name: name || "Host",
      heroId: "",
      ready: false,
      stats: null,
      effects: {},
      cds: {},
      alive: true,
    };
    io.to(code).emit("room:update", rooms[code]);
    cb?.({ ok: true, code });
  });

  // Unirse a sala
  socket.on("room:join", ({ code, name }, cb) => {
    const room = rooms[code];
    if (!room) return cb?.({ ok: false, error: "La sala no existe" });
    if (room.stage !== "lobby")
      return cb?.({ ok: false, error: "La partida ya comenzó" });
    const count = Object.keys(room.players).length;
    if (count >= 6)
      return cb?.({
        ok: false,
        error: "La sala está llena (máx. 6 jugadores)",
      });

    socket.join(code);
    room.players[socket.id] = {
      id: socket.id,
      name: name || `Jugador ${count + 1}`,
      heroId: "",
      ready: false,
      stats: null,
      effects: {},
      cds: {},
      alive: true,
    };
    io.to(code).emit("room:update", room);
    cb?.({ ok: true, code, room });
  });

  // Selección de héroe único
  socket.on("player:update", ({ heroId, ready }, cb) => {
    const room = getRoomBySocket(socket);
    if (!room) return;
    const p = room.players[socket.id];
    if (!p) return;

    if (heroId !== undefined) {
      if (!HERO_BY_ID[heroId])
        return cb?.({ ok: false, error: "Héroe inválido" });
      // liberar anterior si existía
      if (p.heroId && room.selectedHeroes.has(p.heroId))
        room.selectedHeroes.delete(p.heroId);
      // evitar duplicados
      if (room.selectedHeroes.has(heroId))
        return cb?.({ ok: false, error: "Ese héroe ya fue elegido" });
      p.heroId = heroId;
      room.selectedHeroes.add(heroId);
      p.stats = initHeroStats(HERO_BY_ID[heroId]);
      p.effects = {};
      p.cds = {};
      p.alive = true;
    }

    if (ready !== undefined) p.ready = !!ready;
    io.to(room.code).emit("room:update", room);
    cb?.({ ok: true });
  });

  // Iniciar historia
  socket.on("story:start", () => {
    const room = getRoomBySocket(socket);
    if (!room || room.hostId !== socket.id) return;
    const count = Object.keys(room.players).length;
    if (count < 2)
      return socket.emit("error:message", {
        text: "Se necesitan al menos 2 jugadores",
      });

    room.stage = "story";
    emitStoryNode(room);
  });

  // Votación: iniciar
  socket.on("vote:start", ({ nodeId, options, durationMs = 30000 }) => {
    const room = getRoomBySocket(socket);
    if (!room || room.hostId !== socket.id) return;
    if (room.activeVote) return;

    room.stage = "vote";
    room.nodeId = nodeId || room.nodeId;
    room.activeVote = {
      nodeId: room.nodeId,
      options,
      startedAt: Date.now(),
      durationMs,
      votes: {},
    };
    room.activeVote.timeoutHandle = setTimeout(
      () => finalizeVote(room.code),
      durationMs
    );

    io.to(room.code).emit("vote:started", {
      nodeId: room.nodeId,
      options,
      endsAt: Date.now() + durationMs,
    });
    io.to(room.code).emit("room:update", room);
  });

  // Votación: votar
  socket.on("vote:cast", ({ optionId }) => {
    const room = getRoomBySocket(socket);
    if (!room || !room.activeVote) return;
    if (!room.players[socket.id]) return;
    if (!room.activeVote.options.find((o) => o.id === optionId)) return;

    room.activeVote.votes[socket.id] = optionId;
    io.to(room.code).emit("vote:update", { votes: room.activeVote.votes });

    const players = Object.keys(room.players).length;
    const { winner, tally } = majorityOption(room.activeVote.votes);
    if (winner && tally[winner] > Math.floor(players / 2)) {
      clearTimeout(room.activeVote.timeoutHandle);
      finalizeVote(room.code);
    }
  });

  function finalizeVote(code) {
    const room = rooms[code];
    if (!room || !room.activeVote) return;
    const { votes, options } = room.activeVote;
    const { winner } = majorityOption(votes);
    const chosen = winner || randChoice(options.map((o) => o.id));
    room.activeVote = undefined;
    room.stage = "story";
    nextFromOption(room, chosen);
  }

  // Dados “públicos”
  socket.on("dice:heroD20", (_, cb) => {
    const room = getRoomBySocket(socket);
    if (!room) return;
    const d = rollHeroD20();
    io.to(room.code).emit("dice:heroRolled", { by: socket.id, d20: d });
    cb?.({ d20: d });
  });
  socket.on("dice:villain", (_, cb) => {
    const room = getRoomBySocket(socket);
    if (!room) return;
    const pack = rollVillainPack();
    io.to(room.code).emit("dice:villainRolled", pack);
    cb?.(pack);
  });

  // Iniciar batalla (host) — usa boss del nodo actual si no se especifica
  socket.on("battle:start", ({ bossId }, cb) => {
    const room = getRoomBySocket(socket);
    if (!room || room.hostId !== socket.id) return;
    const node = getNode(room.chapterId, room.nodeId);
    const chosenBossId = bossId || node?.boss;
    const ok = startBattle(room, chosenBossId || "llorona");
    if (!ok) return cb?.({ ok: false, error: "Boss inválido" });

    io.to(room.code).emit("battle:init", {
      boss: room.battle.boss,
      order: room.battle.order.map((s) =>
        s.type === "hero"
          ? {
              type: "hero",
              heroId: s.ref.heroId,
              name: s.ref.name,
              hp: s.ref.stats.hp,
            }
          : {
              type: "boss",
              id: room.battle.boss.id,
              name: room.battle.boss.name,
              hp: room.battle.boss.hp,
            }
      ),
      turnIndex: room.battle.turnIndex,
    });
    cb?.({ ok: true });
  });

  // Acción de héroe (habilidad)
  socket.on("battle:action", ({ abilityId }, cb) => {
    const room = getRoomBySocket(socket);
    if (!room || room.stage !== "battle")
      return cb?.({ ok: false, error: "No hay batalla" });

    const B = room.battle;
    const turnSlot = B.order[B.turnIndex];
    if (!turnSlot || turnSlot.type !== "hero")
      return cb?.({ ok: false, error: "No es turno de héroe" });
    if (turnSlot.ref.socketId !== socket.id)
      return cb?.({ ok: false, error: "No puedes actuar por otro jugador" });
    if (!turnSlot.ref.alive)
      return cb?.({ ok: false, error: "Estás fuera de combate" });

    // ¿aturdido/knock?
    const effAcc = getStatWithEffects(0, turnSlot.ref.effects, "accuracy");
    if (effAcc <= -900) {
      io.to(room.code).emit("battle:log", {
        type: "skip",
        text: `${turnSlot.ref.name} está aturdido y pierde su turno`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true, skipped: true });
    }

    const heroData = HERO_BY_ID[turnSlot.ref.heroId];
    const ability = abilityById(heroData, abilityId);
    if (!ability) return cb?.({ ok: false, error: "Habilidad inválida" });

    // Chequeo de CD/mana
    turnSlot.ref.cds = turnSlot.ref.cds || {};
    if (turnSlot.ref.cds[ability.id])
      return cb?.({ ok: false, error: "Habilidad en enfriamiento" });
    const needMana = ability.mana || 0;
    if (turnSlot.ref.stats.mana < needMana)
      return cb?.({ ok: false, error: "Maná insuficiente" });
    turnSlot.ref.stats.mana -= needMana;
    if (ability.cd) turnSlot.ref.cds[ability.id] = ability.cd;

    // Efectos no dañinos
    if (ability.type === "buff") {
      turnSlot.ref.effects = turnSlot.ref.effects || {};
      turnSlot.ref.effects[`buff_${ability.id}`] = {
        ...(ability.effect || {}),
        turnsLeft: ability.duration || 2,
      };
      io.to(room.code).emit("battle:log", {
        type: "buff",
        text: `${turnSlot.ref.name} usa ${ability.name}`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true });
    }
    if (ability.type === "debuff") {
      B.boss.effects = B.boss.effects || {};
      B.boss.effects[`debuff_${ability.id}`] = {
        ...(ability.effect || {}),
        turnsLeft: ability.duration || 2,
      };
      io.to(room.code).emit("battle:log", {
        type: "debuff",
        text: `${turnSlot.ref.name} aplica ${ability.name} al jefe`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true });
    }
    if (ability.type === "heal") {
      // curación al equipo
      const amount = ability.power || 30;
      B.order.forEach((s) => {
        if (s.type === "hero" && s.ref.alive) {
          const baseMax = HERO_BY_ID[s.ref.heroId].base.hp;
          s.ref.stats.hp = Math.min(baseMax, s.ref.stats.hp + amount);
        }
      });
      io.to(room.code).emit("battle:log", {
        type: "heal",
        text: `${turnSlot.ref.name} cura al equipo (+${ability.power || 30})`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true });
    }
    if (ability.type === "heal_single") {
      const amount = ability.power || 40;
      const baseMax = HERO_BY_ID[turnSlot.ref.heroId].base.hp;
      turnSlot.ref.stats.hp = Math.min(baseMax, turnSlot.ref.stats.hp + amount);
      io.to(room.code).emit("battle:log", {
        type: "heal",
        text: `${turnSlot.ref.name} se cura (+${amount})`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true });
    }
    if (ability.type === "summon") {
      B.boss.effects = B.boss.effects || {};
      B.boss.effects[`summon_${ability.id}`] = {
        dot: ability.power || 18,
        turnsLeft: ability.duration || 2,
      };
      io.to(room.code).emit("battle:log", {
        type: "summon",
        text: `${turnSlot.ref.name} invoca (${ability.name}) causando daño periódico`,
      });
      endTurnAndTick(room);
      return cb?.({ ok: true });
    }

    // Ataques (physical/magic/ultimate)
    const d20 = rollHeroD20();
    const attackerAtk = getStatWithEffects(
      turnSlot.ref.stats.attack,
      turnSlot.ref.effects,
      "attack"
    );
    const defenderDef = getStatWithEffects(
      B.boss.defense,
      B.boss.effects,
      "defense"
    );
    const attackerAcc = getStatWithEffects(0, turnSlot.ref.effects, "accuracy");
    const defenderEva = getStatWithEffects(0, B.boss.effects, "evasion");

    let hit = computeHit(d20, attackerAcc, defenderEva);
    let critical = false;
    if (d20 === 20) {
      hit = true;
      critical = true;
    }
    if (d20 === 1) {
      hit = false;
    }

    if (hit) {
      const base = (ability.power || 0) + Math.floor(attackerAtk / 5);
      let damage = Math.max(0, base - Math.floor(defenderDef / 6));
      if (critical) damage *= 2;

      // extras
      if (ability.root) {
        B.boss.effects = B.boss.effects || {};
        B.boss.effects[`root_${ability.id}`] = {
          root: 1,
          turnsLeft: ability.root,
        };
      }
      if (ability.dot?.poison) {
        B.boss.effects = B.boss.effects || {};
        B.boss.effects[`dot_${ability.id}`] = {
          dot: ability.dot.poison,
          turnsLeft: ability.duration || 2,
        };
      }

      B.boss.hp = Math.max(0, B.boss.hp - damage);
      io.to(room.code).emit("battle:log", {
        type: "hit",
        text: `${turnSlot.ref.name} usa ${ability.name} (d20=${d20}${
          critical ? " CRIT" : ""
        }) → ${damage} dmg`,
      });
    } else {
      io.to(room.code).emit("battle:log", {
        type: "miss",
        text: `${turnSlot.ref.name} falla ${ability.name} (d20=${d20})`,
      });
    }

    // ¿fin?
    const winner = checkBattleEnd(room);
    if (winner) {
      io.to(room.code).emit("battle:end", { winner });
      room.stage = "story";
      if (winner === "heroes") {
        maybeAdvanceAfterBoss(room);
      }
      return cb?.({ ok: true, winner });
    }

    endTurnAndTick(room);
    cb?.({ ok: true });
  });

  // Turno del jefe
  socket.on("battle:bossTurn", (_, cb) => {
    const room = getRoomBySocket(socket);
    if (!room || room.stage !== "battle")
      return cb?.({ ok: false, error: "No hay batalla" });

    const B = room.battle;
    const turnSlot = B.order[B.turnIndex];
    if (!turnSlot || turnSlot.type !== "boss")
      return cb?.({ ok: false, error: "No es turno del jefe" });

    // Efectos boss al entrar al turno
    applyEffectsTick(B.boss);

    // Elegir y aplicar habilidad
    const ability = bossChooseAbility(B.boss);
    if (ability.cd) turnSlot.ref.cds[ability.id] = ability.cd;

    const pack = rollVillainPack();
    const atkRoll = pack.d20[0],
      effRoll = pack.d20[1];
    const baseRoll = pack.d4[0] + pack.d4[1];

    // target aleatorio vivo
    const aliveHeroes = B.order.filter((s) => s.type === "hero" && s.ref.alive);
    const target = randChoice(aliveHeroes);
    if (!target) {
      io.to(room.code).emit("battle:end", { winner: "boss" });
      room.stage = "story";
      return cb?.({ ok: true, winner: "boss" });
    }

    if (ability.type === "debuff") {
      target.ref.effects = target.ref.effects || {};
      target.ref.effects[`debuff_${ability.id}`] = {
        ...(ability.effect || {}),
        turnsLeft: ability.duration || 2,
      };
      io.to(room.code).emit("battle:log", {
        type: "debuff",
        text: `${B.boss.name} aplica ${ability.name} a ${target.ref.name}`,
      });
    } else if (ability.type === "summon") {
      target.ref.effects = target.ref.effects || {};
      target.ref.effects[`summon_${ability.id}`] = {
        dot: ability.power || 20,
        turnsLeft: ability.duration || 2,
      };
      io.to(room.code).emit("battle:log", {
        type: "summon",
        text: `${B.boss.name} invoca (${ability.name}) afectando a ${target.ref.name}`,
      });
    } else {
      // ataque
      const targetDef = getStatWithEffects(
        target.ref.stats.defense,
        target.ref.effects,
        "defense"
      );
      const targetEva = getStatWithEffects(0, target.ref.effects, "evasion");
      let hit = computeHit(atkRoll, 0, targetEva);
      if (atkRoll === 20) hit = true;
      if (atkRoll === 1) hit = false;

      if (hit) {
        const base =
          (ability.power || 0) + Math.floor(B.boss.attack / 5) + baseRoll;
        let damage = Math.max(0, base - Math.floor(targetDef / 6));

        // efectos con segundo d20
        if (ability.bleed && effRoll >= 12) {
          target.ref.effects = target.ref.effects || {};
          target.ref.effects[`bleed_${ability.id}`] = {
            dot: ability.bleed,
            turnsLeft: ability.duration || 2,
          };
        }
        if (ability.fear && effRoll >= 12) {
          target.ref.effects = target.ref.effects || {};
          target.ref.effects[`fear_${ability.id}`] = {
            accuracy: -5,
            turnsLeft: 1,
          };
        }
        if (ability.root && effRoll >= 12) {
          target.ref.effects = target.ref.effects || {};
          target.ref.effects[`root_${ability.id}`] = { root: 1, turnsLeft: 1 };
        }
        if (ability.knock && effRoll >= 12) {
          target.ref.effects = target.ref.effects || {};
          target.ref.effects[`knock_${ability.id}`] = {
            accuracy: -999,
            turnsLeft: 1,
          }; // pierde turno
        }

        target.ref.stats.hp = Math.max(0, target.ref.stats.hp - damage);
        if (target.ref.stats.hp === 0) target.ref.alive = false;
        io.to(room.code).emit("battle:log", {
          type: "hit",
          text: `${B.boss.name} usa ${ability.name} (2d20=${atkRoll}/${effRoll}, 2d4=${baseRoll}) → ${damage} dmg a ${target.ref.name}`,
        });
      } else {
        io.to(room.code).emit("battle:log", {
          type: "miss",
          text: `${B.boss.name} falla ${ability.name} (d20=${atkRoll})`,
        });
      }
    }

    const winner = checkBattleEnd(room);
    if (winner) {
      io.to(room.code).emit("battle:end", { winner });
      room.stage = "story";
      if (winner === "heroes") {
        maybeAdvanceAfterBoss(room);
      }
      return cb?.({ ok: true, winner });
    }

    tickCooldowns(turnSlot);
    battleAdvanceTurn(room);
    io.to(room.code).emit("battle:turn", { turnIndex: room.battle.turnIndex });
    cb?.({ ok: true });
  });

  // Desconexión
  socket.on("disconnect", () => {
    const room = getRoomBySocket(socket);
    if (!room) return;
    const hadHero = room.players[socket.id]?.heroId;
    if (hadHero) room.selectedHeroes.delete(hadHero);
    delete room.players[socket.id];

    if (room.hostId === socket.id) {
      const first = Object.keys(room.players)[0];
      room.hostId = first || "";
    }
    io.to(room.code).emit("room:update", room);
    if (Object.keys(room.players).length === 0) {
      if (room.activeVote?.timeoutHandle)
        clearTimeout(room.activeVote.timeoutHandle);
      delete rooms[room.code];
    }
  });
});

// ===================== HTTP básico =====================
app.get("/", (_req, res) => {
  res.send("Colombia Ancestral Server ✅ Historia + Votación + Combate");
});

// ===================== Start =====================
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en :${PORT}`);
});
