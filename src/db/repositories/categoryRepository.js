import { db } from '../database';

export const getAllCategories = () => db.categories.orderBy('orderNum').toArray();

export const getCategoryById = (id) => db.categories.get(id);

export const createCategory = (category) =>
  db.categories.add({
    id: crypto.randomUUID(),
    orderNum: 0,
    ...category,
  });

export const updateCategory = (id, changes) =>
  db.categories.update(id, changes);

export const deleteCategory = (id) => db.categories.delete(id);

export const reorderCategories = async (orderedIds) => {
  await db.transaction('rw', db.categories, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.categories.update(orderedIds[i], { orderNum: i });
    }
  });
};
