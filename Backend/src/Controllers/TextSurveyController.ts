import DatabaseManager from "../Common/DatabaseManager.interface";
import TextSurvey from "../Models/TextSurvey";
import { DBCollections } from "../Common/DBCollections.enum";
import IController from "./IController.interface";

export default class TextSurveyController implements IController<TextSurvey, string> {
  constructor(
    private databaseManager: DatabaseManager,
  ) { }

  public async count(): Promise<number> {
    return await this.databaseManager.count(DBCollections.TEXT_SURVEYS);
  }

  public async create(modelObject: TextSurvey): Promise<boolean> {
    const createResult = await this.databaseManager.save(modelObject, DBCollections.TEXT_SURVEYS);
    return createResult;
  }
  
  public async createMany(modelObjects: TextSurvey[]): Promise<boolean> {
    const createResult = await this.databaseManager.saveMany(modelObjects, DBCollections.TEXT_SURVEYS);
    return createResult;
  }
  
  public async get(id: string): Promise<TextSurvey | undefined> {
    try {
      const returnTextSurvey = await this.databaseManager.get(id.toString(), DBCollections.TEXT_SURVEYS) as TextSurvey;
      return returnTextSurvey;
    } catch {
      return undefined;
    }
  }

  public async getWithFilter(filter: any): Promise<TextSurvey[] | undefined> {
    try {
      const deserializedTEXT_SURVEYS = await this.databaseManager.getWithFilter(filter, DBCollections.TEXT_SURVEYS) as TextSurvey[];

      return deserializedTEXT_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async getRange(start: number, end: number): Promise<TextSurvey[] | undefined> {
    try {
      const deserializedTEXT_SURVEYS = await this.databaseManager.getRange(start, end, DBCollections.TEXT_SURVEYS) as TextSurvey[];

      return deserializedTEXT_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async getAll(): Promise<TextSurvey[] | undefined> {
    try {
      const deserializedTEXT_SURVEYS = await this.databaseManager.getAll(DBCollections.TEXT_SURVEYS) as TextSurvey[];
  
      return deserializedTEXT_SURVEYS;
    } catch {
      return undefined;
    }
  }

  public async update(oldModelObjectId: string, updatedModelObject: TextSurvey): Promise<boolean> {
    const updateResult = await this.databaseManager.update(oldModelObjectId.toString(), updatedModelObject, DBCollections.TEXT_SURVEYS);

    return updateResult;
  }

  public async updateField(id: string, field: string, value: any): Promise<boolean> {
    const updateResult = await this.databaseManager.updateField(id.toString(), field, value, DBCollections.TEXT_SURVEYS);

    return updateResult;
  }

  public async delete(modelObjectId: string): Promise<boolean> {
    const deleteResult = await this.databaseManager.delete(modelObjectId.toString(), DBCollections.TEXT_SURVEYS);

    return deleteResult;
  } 
} 
