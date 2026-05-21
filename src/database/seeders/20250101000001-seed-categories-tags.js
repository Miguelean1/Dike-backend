'use strict';

const categories = [
  { name: 'Muebles', description: 'Sofás, mesas, sillas, armarios...' },
  { name: 'Electrónica', description: 'Televisores, ordenadores, móviles...' },
  { name: 'Ropa', description: 'Prendas de vestir y complementos' },
  { name: 'Libros', description: 'Libros, revistas y material de estudio' },
  { name: 'Juguetes', description: 'Juguetes y juegos para niños' },
  { name: 'Deporte', description: 'Material deportivo y fitness' },
  { name: 'Hogar', description: 'Utensilios de cocina, decoración, herramientas' },
  { name: 'Vehículos', description: 'Bicicletas, patinetes, accesorios' },
  { name: 'Jardín', description: 'Plantas, herramientas de jardín' },
  { name: 'Otros', description: 'Todo lo que no encaja en otras categorías' },
];

const tags = [
  { name: 'Nuevo' },
  { name: 'Como nuevo' },
  { name: 'Buen estado' },
  { name: 'Usado' },
  { name: 'Para reparar' },
  { name: 'Urgente' },
  { name: 'Gratis' },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('categories', categories, { ignoreDuplicates: true });
    await queryInterface.bulkInsert('tags', tags, { ignoreDuplicates: true });
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('tags', null, {});
  },
};
