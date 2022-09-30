import DatabaseManager from "../Common/DatabaseManager.interface";
import ScaleSurvey from "../Models/ScaleSurvey";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

export default class ScaleSurveyController implements IController<ScaleSurvey, string> {
  constructor(
    private databaseManager: DatabaseManager,
  ) { }

  public async count(): Promise<number> {
    return await this.databaseManager.count(DBCollections.SCALE_SURVEYS);
  }

  public async create(modelObject: ScaleSurvey): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.SCALE_SURVEYS);
    return createResult;
  }
  
  public async createMany(modelObjects: ScaleSurvey[]): Promise<boolean> {
    const createResult = await this.databaseManager.saveMany(modelObjects, DBCollections.SCALE_SURVEYS);
    return createResult;
  }
  
  public async get(id: string): Promise<ScaleSurvey | undefined> {
    try {
      const returnScaleSurvey = await this.databaseManager.get(id.toString(), DBCollections.SCALE_SURVEYS) as ScaleSurvey;
      return returnScaleSurvey;
    } catch {
      return undefined;
    }
  }

  public async getWithFilter(filter: any): Promise<ScaleSurvey[] | undefined> {
    try {
      const deserializedSCALE_SURVEYS = await this.databaseManager.getWithFilter(filter, DBCollections.SCALE_SURVEYS) as ScaleSurvey[];

      return deserializedSCALE_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async getRange(start: number, end: number): Promise<ScaleSurvey[] | undefined> {
    try {
      const deserializedSCALE_SURVEYS = await this.databaseManager.getRange(start, end, DBCollections.SCALE_SURVEYS) as ScaleSurvey[];

      return deserializedSCALE_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async getAll(): Promise<ScaleSurvey[] | undefined> {
    try {
      const deserializedSCALE_SURVEYS = await this.databaseManager.getAll(DBCollections.SCALE_SURVEYS) as ScaleSurvey[];
  
      return deserializedSCALE_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async update(oldModelObjectId: string, updatedModelObject: ScaleSurvey): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.SCALE_SURVEYS);

    return updateResult;
  }

  public async updateField(id: string, field: string, value: any): Promise<boolean> {
    const updateResult = await this.databaseManager.updateField(id.toString(), field, value, DBCollections.SCALE_SURVEYS);

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.SCALE_SURVEYS);

    return deleteResult;
  } 
} 
