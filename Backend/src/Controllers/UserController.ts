import DatabaseManager from "../Common/DatabaseManager.interface";
import User from "../Models/User";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

export default class UserController implements IController<User, string> {
  constructor(
    private databaseManager: DatabaseManager,
  ) { }

  public async count(): Promise<number> {
    return await this.databaseManager.count(DBCollections.USERS);
  }

  public async create(modelObject: User): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.USERS);
    return createResult;
  }
  
  public async createMany(modelObjects: User[]): Promise<boolean> {
    const createResult = await this.databaseManager.saveMany(modelObjects, DBCollections.USERS);
    return createResult;
  }
  
  public async get(id: string): Promise<User | undefined> {
    try {
      const returnUser = await this.databaseManager.get(id.toString(), DBCollections.USERS) as User;
      return returnUser;
    } catch {
      return undefined;
    }
  }

  public async getWithFilter(filter: any): Promise<User[] | undefined> {
    try {
      const deserializedUsers = await this.databaseManager.getWithFilter(filter, DBCollections.USERS) as User[];

      return deserializedUsers;
    } catch {
      return undefined;
    }
  }

  public async getRange(start: number, end: number): Promise<User[] | undefined> {
    try {
      const deserializedUsers = await this.databaseManager.getRange(start, end, DBCollections.USERS) as User[];

      return deserializedUsers;
    } catch {
      return undefined;
    }
  }

  public async getAll(): Promise<User[] | undefined> {
    try {
      const deserializedUsers = await this.databaseManager.getAll(DBCollections.USERS) as User[];
  
      return deserializedUsers;
    } catch {
      return undefined;
    }
  }

  public async update(oldModelObjectId: string, updatedModelObject: User): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.USERS);

    return updateResult;
  }

  public async updateField(id: string, field: string, value: any): Promise<boolean> {
    const updateResult = await this.databaseManager.updateField(id.toString(), field, value, DBCollections.USERS);

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.USERS);

    return deleteResult;
  } 
} 
