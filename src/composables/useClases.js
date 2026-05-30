import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useClases() {
  const clases = ref(null);
  const clase = ref(null);

  const { executeQuery } = useMySQL();

  async function loadClases() {
    try {
      const result = await executeQuery(
        `SELECT
          *
        FROM Clase`,
      ); 
      
      clases.value = result.result.resultRows.map((row) => ({
        id: row[0],
        nombre: row[1],
        dadoVida: row[2],
      }));

    } catch (err) {
      console.error("Failed to load class:", err);
    }
  }
  
  async function loadClaseById(id) {
    try {
      const result = await executeQuery(
        `SELECT
          *
        FROM Clase
        WHERE id = ?`,
        [id]
      ); 
      
      clase.value = {
        nombre: result.result.resultRows[0][1],
        dadoVida: result.result.resultRows[0][2],
      }

    } catch (err) {
      console.error("Failed to load class:", err);
    }
  }

  return {
    clase,
    clases,
    loadClases,
    loadClaseById,
  };
}