import Savable from "./Savable.interface";
import { DBCollections } from "./DBCollections.enum";

export default interface DatabaseManager {
  count(dbCollection: DBCollections): Promise<number>;
  save(object: Savable, dbCollection: DBCollections): Promise<boolean>;
  saveMany(objects: Savable[], dbCollection: DBCollections): Promise<boolean>;
  get(id: string, dbCollection: DBCollections): Promise<Savable>;
  getWithFilter(filter: any, dbCollection: DBCollections): Promise<Savable[]>;
  getMany(ids: string[], dbCollection: DBCollections): Promise<Savable[]>;
  getRange(start: number, end: number, dbCollection: DBCollections): Promise<Savable[]>;
  getAll(dbCollection: DBCollections): Promise<Savable[]>;
  updateField(id: string, field: string, value: any, dbCollection: DBCollections): Promise<boolean>;
  update(id: string, object: Savable, dbCollection: DBCollections): Promise<boolean>;
  delete(id: string, dbCollection: DBCollections): Promise<boolean>;
  deleteAll(dbCollection: DBCollections): Promise<boolean>;
}