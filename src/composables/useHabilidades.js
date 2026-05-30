import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useHabilidades() {
  const habilidades = ref(null);

  const { executeQuery } = useMySQL();

  async function loadHabilidades(id) {
    try {
      const result = await executeQuery(
        `SELECT
          *
        FROM Habilidad h
        LEFT JOIN Clase_tiene_Habilidad chh ON h.id = chh.Habilidad_id
        WHERE chh.Clase_id = ?`,
        [id]
      ); 
      
      if (result) {
        habilidades.value = result.result.resultRows.map((row) => ({
          id: row[0],
          nombre: row[1],
          descripcion: row[2],
          danyo: row[3],
          bonus: row[4],
        }));
      }
    } catch (err) {
      console.error("Failed to load habilidad:", err);
    }
  }

  return {
    habilidades,
    loadHabilidades,
  };
}