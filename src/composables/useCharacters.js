import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useCharacters() {
  const character = ref(null);
  const clase = ref(null);
  const characters = ref(null);
  const abilityScores = ref(null);
  const campaign = ref(null);

  const { executeQuery } = useMySQL();

  async function loadCharacterFromId(id) {
    try {
      const result = await executeQuery(
        `SELECT
          p.id,
          p.nombre,
          p.personajeNivel,
          p.health,
          p.maxHealth,
          c.id,
          c.nombre,
          s.str,
          s.dex,
          s.con,
          s.int,
          s.wis,
          s.cha,
          ca.id,
          ca.nombre
        FROM Personaje p
        JOIN Stats s ON p.personajeStats = s.id
        LEFT JOIN Clase c ON p.personajeClase = c.id
        LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
        LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
        WHERE p.id = ?`,
        [id]
      ); 
      
      if (result) {

        character.value = {
          charId: result.result.resultRows[0][0],
          nombre: result.result.resultRows[0][1],
          nivel: result.result.resultRows[0][2],
          health: result.result.resultRows[0][3],
          maxHealth: result.result.resultRows[0][4],
          clase: result.result.resultRows[0][6],
        };

        abilityScores.value = {
          str: result.result.resultRows[0][7],
          dex: result.result.resultRows[0][8],
          con: result.result.resultRows[0][9],
          int: result.result.resultRows[0][10],
          wis: result.result.resultRows[0][11],
          cha: result.result.resultRows[0][12],
        };

        campaign.value = {
          campId: result.result.resultRows[0][13],
          nombre: result.result.resultRows[0][14],
        };

        clase.value = {
          id: result.result.resultRows[0][5]
        }
      } else {
        console.log("No hay personajes")
      }
    } catch (err) {
      console.error("Failed to load character:", err);
    }
  }

  async function loadCharactersFromUser(id) {
    try {
      const result = await executeQuery(
        `SELECT
          p.id,
          p.nombre,
          p.personajeNivel,
          c.nombre,
          ca.nombre
        FROM Personaje p
        LEFT JOIN Clase c ON p.personajeClase = c.id
        LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
        LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
        WHERE p.personajeUsuario = ?`,
        [id]
      ); 

      if(result) {
        
        characters.value = result.result.resultRows.map((row) => ({
          charId: row[0],
          nombre: row[1],
          nivel: row[2],
          clase: row[3],
          campanya: row[4],
        }));
      } else {
        console.log("No hay personajes")
      }
    } catch (err) {
      console.error("Failed to load character:", err);
    }
  }

  async function loadCharactersFromCampaign(id) {
    try {
      const result = await executeQuery(
        `SELECT
          p.id,
          p.nombre,
          p.personajeNivel,
          c.nombre,
          ca.nombre
        FROM Personaje p
        LEFT JOIN Clase c ON p.personajeClase = c.id
        LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
        LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
        WHERE chp.Campanya_id = ?`,
        [id]
      ); 

      characters.value = result.result.resultRows.map((row) => ({
        charId: row[0],
        nombre: row[1],
        nivel: row[2],
        clase: row[3],
        campanya: row[4],
      }));

    } catch (err) {
      console.error("Failed to load character:", err);
    }
  }

  async function createCharacter(nombre, nivel, health, clase, stats, usuario) {
    try {
      const result = await executeQuery(
        `INSERT INTO Personaje (nombre, personajeNivel, health, maxHealth, personajeClase, personajeStats, personajeUsuario) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          nivel,
          health,
          health,
          clase,
          stats,
          usuario,
        ]
      );
      return result;
    } catch (err) {
      console.error("Failed to create character:", err);
    }
  }

  async function changeHP(hp, id) {
    try {
      const result = await executeQuery(
        "UPDATE Personaje SET health = ? WHERE id = ?",
        [hp, id],
      );

      return result;
    } catch (err) {
      console.error("Failed to load characters:", err);
    }
  }

  async function editCharacter(nombre, nivel, health, clase, stats, id) {
    try {
      const result = await executeQuery(
        `UPDATE Personaje SET 
        nombre = ?, 
        personajeNivel = ?, 
        health = ?, 
        maxHealth = ?, 
        personajeClase = ?, 
        personajeStats = ? 
        WHERE id = ?`,
        [
          nombre,
          nivel,
          health,
          health,
          clase,
          stats,
          id,
        ]
      );
      return result;
    } catch (err) {
      console.error("Failed to create character:", err);
    }
  }

  return {
    character,
    clase,
    characters,
    abilityScores,
    campaign,
    loadCharacterFromId,
    loadCharactersFromUser,
    loadCharactersFromCampaign,
    createCharacter,
    changeHP,
    editCharacter
  };
}