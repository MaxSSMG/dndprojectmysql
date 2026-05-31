import { useMySQL } from "@/composables/useMySQL";

export function useStats() {
  const { executeQuery } = useMySQL();

  async function createStats(str, dex, con, int, wis, cha) {
    try {
      const result = await executeQuery(
        "INSERT INTO Stats (str, dex, con, intel, wis, cha) VALUES (?, ?, ?, ?, ?, ?)",
        [str, dex, con, int, wis, cha],
      );

      const insertedId = result.result.insertId;
      console.log("Stats created with ID:", insertedId);
      return insertedId;
    } catch (err) {
      console.log("Failed to create stats:", err);
    }
  }

  return {
    createStats,
  };
}
