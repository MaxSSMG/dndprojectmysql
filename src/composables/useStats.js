import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useStats() {
  const { executeQuery } = useMySQL();

  async function createStats(str, dex, con, int, wis, cha) {
    try {
      const result = await executeQuery(
        "INSERT INTO Stats (str, dex, con, int, wis, cha) VALUES (?, ?, ?, ?, ?, ?)",
        [str, dex, con, int, wis, cha],
      );

      console.log("Stats created with ID:", result);
      return result;
    } catch (err) {
      console.log("Failed to create stats:", err);
    }
  }

  async function getLastStats() {
    try {
      const result = await executeQuery(
        "SELECT * FROM Stats ORDER BY id DESC LIMIT 1"
      );

      return result.result.resultRows[0][0];
    } catch (err) {
      console.log("Failed to get last stats:", err);
    }
  }
  
  return {
    createStats,
    getLastStats,
  };
}
