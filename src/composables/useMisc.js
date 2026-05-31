import { useMySQL } from "@/composables/useMySQL";

export function useMisc() {
  const { executeQuery } = useMySQL();

  async function drop() {
    const result = await executeQuery(`
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS Personaje_tiene_Item;
      DROP TABLE IF EXISTS Personaje_tiene_Habilidad;
      DROP TABLE IF EXISTS Clase_tiene_Habilidad;
      DROP TABLE IF EXISTS Campanya_tiene_Personaje;
      DROP TABLE IF EXISTS Item;
      DROP TABLE IF EXISTS Stats;
      DROP TABLE IF EXISTS Habilidad;
      DROP TABLE IF EXISTS Clase;
      DROP TABLE IF EXISTS Personaje;
      DROP TABLE IF EXISTS Campanya;
      DROP TABLE IF EXISTS Usuario;
      SET FOREIGN_KEY_CHECKS = 1;
    `);

    console.log("Tablas borradas");
    return result;
  }

  async function demoData() {
    try {
      console.log("Creating demo classes and abilities...");

      // Create Classes
      const classes = [
        { id: 1, name: "Guerrero", dadoVida: "1d12" },
        { id: 2, name: "Mago", dadoVida: "1d6" },
        { id: 3,name: "Pícaro", dadoVida: "1d8" },
      ];


      for (const clase of classes) {
        const result = await executeQuery(
          `INSERT IGNORE INTO Clase (id, nombre, dadoVida) VALUES (?, ?, ?)`,
          [clase.id, clase.name, clase.dadoVida]
        );
      }

      const abilities = [
        // Barbarian
        {
          clase: 1,
          id: 1,
          nombre: "Furia",
          descripcion: "Luchas con una ferocidad primitiva en la batalla.",
        },
        {
          clase: 1,
          id: 2,
          nombre: "Ataque temerario",
          danyo: "Daño igual al ataque normal",
          bonus: "STR",
          descripcion: "Durante este turno ataca con ventaja, pero recibe ataques con ventaja hasta tu próximo turno.",
        },
        // Wizard
        {
          clase: 2,
          id: 3,
          nombre: "Bola de fuego",
          danyo: "8d6",
          bonus: "INT",
          descripcion: "Un rayo brillante surge de tu dedo índice hasta un punto que elijas dentro del alcance y explota con un leve estruendo en un estallido de llamas.",
        },
        {
          clase: 2,
          id: 4,
          nombre: "Armadura de mago",
          danyo: "0",
          bonus: "INT",
          descripcion: "Tocas a una criatura voluntaria que no lleve armadura y una fuerza protectora mágica la rodea hasta que el conjuro termina.",
        },
        // Rogue
        {
          clase: 3,
          id: 5,
          nombre: "Ataque furtivo",
          danyo: "Daño igual al ataque normal + 1d6",
          bonus: "",
          descripcion: "Sabes aprovechar la distracción de un enemigo para atacarlo por la espalda. Una vez por turno, puedes infligir daño adicional a una criatura a la que impactes con un ataque si tienes ventaja en la tirada de ataque.",
        },
        {
          clase: 3,
          id: 6,
          nombre: "Evasión",
          danyo: "0",
          bonus: "",
          descripcion: "Puedes apartarte ágilmente de la trayectoria de algunos efectos de área, como el aliento de fuego de un dragón rojo o el conjuro Tormenta de hielo",
        },
      ];

      for (const ability of abilities) {
        const result = await executeQuery(
          `INSERT IGNORE INTO Habilidad (id, nombre, danyo, bonus, descripcion) VALUES (?, ?, ?, ?, ?)`,
          [ability.id, ability.nombre, ability.danyo, ability.bonus, ability.descripcion]
        );

        await executeQuery(
          `INSERT IGNORE INTO Clase_tiene_Habilidad (Clase_id, Habilidad_id) VALUES (?, ?)`,
          [ability.clase, ability.id]
        );
      }

      console.log("Demo data created successfully");
      console.log(`${classes.length} classes created`);
      console.log(`${abilities.length} abilities created`);

      return true;
    } catch (error) {
      console.error("Error creating demo data:", error);
      throw error;
    }
  }

  return {
    drop,
    demoData,
  };
}
