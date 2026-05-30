import { ref } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useMySQL() {
  const isLoading = ref(false);
  const error = ref(null);

  async function executeQuery(sql, params = []) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Query failed');
      }

      return data;
    } catch (fetchError) {
      error.value = fetchError;
      console.error('Database query error:', fetchError);
      throw fetchError;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    executeQuery,
    isLoading,
    error,
  };
}
