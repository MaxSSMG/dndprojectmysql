import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useCampaigns() {
  const campaign = ref(null);
  const lastCampaign = ref(null);
  const campaigns = ref(null);
  const campaignsIn = ref(null);

  const { executeQuery } = useMySQL();

  async function loadCampaigns(id) {
    try {
      const result = await executeQuery(
        `SELECT c.id, c.nombre AS campaignName, u.nombre AS dmName FROM Campanya c 
            LEFT JOIN Usuario u ON c.campanyaDM = u.id
            WHERE campanyaDM != ?`,
        [id],
      );
      campaigns.value = result.result.resultRows.map((row) => ({
        campId: row[0],
        nombre: row[1],
        dm: row[2],
      }));
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }

  async function loadCampaign(id) {
    try {
      const result = await executeQuery(
        `SELECT
          c.id,
          c.nombre AS campaignName,
          c.campanyaDM,
          u.nombre AS dmName
        FROM Campanya c
        LEFT JOIN Campanya_tiene_Personaje chp ON c.id = chp.Campanya_id
        LEFT JOIN Usuario u ON c.campanyaDM = u.id
        WHERE c.id = ?`,
        [id],
      );

      campaign.value = {
        campId: result.result.resultRows[0][0],
        nombre: result.result.resultRows[0][1],
        dmId: result.result.resultRows[0][2],
        dm: result.result.resultRows[0][3],
      };
    } catch (err) {
      console.error("Failed to load campaign:", err);
    }
  }

  async function loadUsersCampaigns(id) {
    try {
      const result = await executeQuery(
        `SELECT c.id, c.nombre AS campaignName, u.nombre AS dmName FROM Campanya c
            LEFT JOIN Usuario u ON c.campanyaDM = u.id
            WHERE campanyaDM = ?`,
        [id],
      );
      campaigns.value = result.result.resultRows.map((row) => ({
        campId: row[0],
        nombre: row[1],
        dm: row[2],
      }));
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }

  async function createCampaign(id) {
    try {
      const result = await executeQuery(
        "INSERT INTO Campanya (nombre, campanyaDM) VALUES (?, ?)",
        ["New Campaign", id],
      );
      return result;
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  }

  async function addToCampaign(campaign, id) {
  try {
    const result = await executeQuery(
      `INSERT INTO Campanya_tiene_Personaje (Campanya_id, Personaje_id)
       SELECT ?, ?
       WHERE NOT EXISTS (
         SELECT 1
         FROM Campanya_tiene_Personaje
         WHERE Campanya_id = ?
         AND Personaje_id = ?
       )`,
      [campaign, id, campaign, id]
    );

    return result;
  } catch (err) {
    console.log(err);
  }
}

  async function searchCampaign(nom) {
    try {
      const result = await executeQuery(
        `SELECT c.id, c.nombre AS campaignName, u.nombre AS dmName FROM Campanya c
            LEFT JOIN Usuario u ON c.campanyaDM = u.id
            WHERE c.nombre LIKE ?`,
        [`%${nom}%`],
      );
      campaigns.value = result.result.resultRows.map((row) => ({
        campId: row[0],
        nombre: row[1],
        dm: row[2],
      }));
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }

  async function editCampaign(nom, id) {
    try {
      const result = await executeQuery(
        "UPDATE Campanya SET nombre = ? WHERE id = ?",
        [nom, id],
      );
      return result;
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }

  async function campaignMember(id) {
    try {
      const result = await executeQuery(
        `SELECT c.id, c.nombre AS campaignName, u.nombre AS dmName
          FROM Campanya c
          LEFT JOIN Usuario u ON c.campanyaDM = u.id
          WHERE EXISTS (
            SELECT 1
            FROM Campanya_tiene_Personaje cp
            JOIN Personaje p
              ON p.id = cp.Personaje_id
            WHERE cp.Campanya_id = c.id
              AND p.personajeUsuario = ?
          );`,
        [id],
      );
      campaignsIn.value = result?.result.resultRows.map((row) => ({
        campId: row[0],
        nombre: row[1],
        dm: row[2],
      }));
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    }
  }

  async function kickFromCampaign(personaje, campanya) {
    try {
      const result = await executeQuery(
        `DELETE FROM Campanya_tiene_Personaje
        WHERE Personaje_id = ? AND Campanya_id = ?`,
        [personaje, campanya],
      );
      return result;
    } catch (err) {
      console.error("Failed to create character:", err);
    }
  }

  async function getLastCampaign() {
    try {
      const result = await executeQuery(
        "SELECT * FROM Campanya ORDER BY id DESC LIMIT 1",
      );
      lastCampaign.value = {
        id: result.result.resultRows[0][0]
      }
    } catch (err) {
      console.log("Failed to get last stats:", err);
    }
  }

  async function deleteCampaign(id) {
    try {
      const result = await executeQuery(
        "DELETE FROM Campanya WHERE id = ?",
        [id]
      );
      lastCampaign.value = {
        id: result.result.resultRows[0][0]
      }
      return result;
    } catch (err) {
      console.log("Failed to get last stats:", err);
    }
  }

  async function leaveCampaign(userId, campaignId) {
    try {
      const result = await executeQuery(
        `DELETE FROM Campanya_tiene_Personaje
        WHERE Campanya_id = ?
        AND Personaje_id IN (
          SELECT id
          FROM Personaje
          WHERE personajeUsuario = ?
        )`,
        [campaignId, userId]
      );

      return result;
    } catch (err) {
      console.log("Failed to leave campaign:", err);
    }
  }

  return {
    campaign,
    lastCampaign,
    campaigns,
    campaignsIn,
    loadCampaigns,
    loadUsersCampaigns,
    loadCampaign,
    createCampaign,
    addToCampaign,
    searchCampaign,
    editCampaign,
    campaignMember,
    kickFromCampaign,
    getLastCampaign,
    deleteCampaign,
    leaveCampaign
  };
}
