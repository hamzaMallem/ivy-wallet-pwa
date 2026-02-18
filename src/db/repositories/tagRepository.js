import { db } from '../database';

export const getAllTags = () => db.tags.orderBy('orderNum').toArray();

export const getTagById = (id) => db.tags.get(id);

export const createTag = (tag) =>
  db.tags.add({
    id: crypto.randomUUID(),
    orderNum: 0,
    dateTime: new Date().toISOString(),
    ...tag,
  });

export const updateTag = (id, changes) => db.tags.update(id, changes);

export const deleteTag = (id) => db.tags.delete(id);
