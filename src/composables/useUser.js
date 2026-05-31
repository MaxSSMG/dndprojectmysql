import { ref } from "vue";
import { useMySQL } from "@/composables/useMySQL";

export function useUser() {
  const { executeQuery } = useMySQL();

  async function login(username, password) {
    try {
      const result = await executeQuery(
        "SELECT * FROM Usuario WHERE nombre = ? AND contrasenya = ?",
        [username, password],
      );

      const rows = result?.result.resultRows || [];

      if (rows.length > 0) {
        const userId = rows[0][0];
        $cookies.set("userId", userId, "1h");
      }

      return rows;
    } catch (err) {
      console.log(err);
    }
  }

  async function register(username, password) {
    try {
      const result = await executeQuery(
        "INSERT INTO Usuario (nombre, contrasenya) VALUES (?, ?)",
        [username, password],
      );

      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async function getName(id) {
    try {
      const result = await executeQuery(
        "SELECT nombre FROM Usuario WHERE id = ?",
        [id],
      );
      const rows = result?.result?.resultRows || [];
      return rows.length > 0 ? rows[0][0] : null;
    } catch (err) {
      console.log(err);
    }
  }

  return {
    login,
    register,
    getName
  };
}
