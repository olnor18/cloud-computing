import DatabaseManager from "../Common/DatabaseManager.interface";
import Telemetry from "../Models/Telemetry";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

export default class TelemetryController implements IController<Telemetry, string> {
  constructor(
    private databaseManager: DatabaseManager,
  ) { }

  public async count(): Promise<number> {
    return await this.databaseManager.count(DBCollections.TELEMETRY);
  }

  public async create(modelObject: Telemetry): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.TELEMETRY);
    return createResult;
  }
  
  public async createMany(modelObjects: Telemetry[]): Promise<boolean> {
    const createResult = await this.databaseManager.saveMany(modelObjects, DBCollections.TELEMETRY);
    return createResult;
  }
  
  public async get(id: string): Promise<Telemetry | undefined> {
    try {
      const returnTelemetry = await this.databaseManager.get(id.toString(), DBCollections.TELEMETRY) as Telemetry;
      return returnTelemetry;
    } catch {
      return undefined;
    }
  }

  public async getWithFilter(filter: any): Promise<Telemetry[] | undefined> {
    try {
      const deserializedTELEMETRY = await this.databaseManager.getWithFilter(filter, DBCollections.TELEMETRY) as Telemetry[];

      return deserializedTELEMETRY;
    } catch {
      return undefined;
    }
  }

  public async getRange(start: number, end: number): Promise<Telemetry[] | undefined> {
    try {
      const deserializedTELEMETRY = await this.databaseManager.getRange(start, end, DBCollections.TELEMETRY) as Telemetry[];

      return deserializedTELEMETRY;
    } catch {
      return undefined;
    }
  }

  public async getAll(): Promise<Telemetry[] | undefined> {
    try {
      const deserializedTELEMETRY = await this.databaseManager.getAll(DBCollections.TELEMETRY) as Telemetry[];
  
      return deserializedTELEMETRY;
    } catch {
      return undefined;
    }
  }

  public async update(oldModelObjectId: string, updatedModelObject: Telemetry): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.TELEMETRY);

    return updateResult;
  }
  
  public async updateField(id: string, field: string, value: any): Promise<boolean> {
    const updateResult = await this.databaseManager.updateField(id.toString(), field, value, DBCollections.TELEMETRY);

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.TELEMETRY);

    return deleteResult;
  } 
} 
