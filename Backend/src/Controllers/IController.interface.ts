export default interface IController<T, U> {
  count(): Promise<number>;
  create(modelObject: T): Promise<boolean>;
  createMany(modelObjects: T[]): Promise<boolean>;
  get(id: U): Promise<T | undefined>;
  getWithFilter(filter: any): Promise<T[] | undefined>;
  getRange(start: number, end: number): Promise<T[] | undefined>;
  getAll(): Promise<T[] | undefined>;
  update(oldModelObjectId: U, updatedModelObject: T): Promise<boolean>;
  updateField(id: U, field: string, value: any): Promise<boolean>;
  delete(modelObjectId: U): Promise<boolean>;
}