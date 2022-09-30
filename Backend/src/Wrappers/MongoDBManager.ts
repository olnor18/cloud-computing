import { Db } from 'mongodb';
import Savable from '../Common/Savable.interface';
import { app } from '../index';
import User from '../Models/User';
import { DBCollections } from '../Common/DBCollections.enum';
import DatabaseManager from './../Common/DatabaseManager.interface';
import PersistenceError from './../Errors/PersistenceError';
import TextSurvey from '../Models/TextSurvey';
import ScaleSurvey from '../Models/ScaleSurvey';
import Telemetry from '../Models/Telemetry';

export default class MongoDbmanager implements DatabaseManager {
  private db: Db;

  constructor() {
    this.db = app.get('database');
  }
  
  public async count(dbCollection: DBCollections): Promise<number> {
    try {
      this.setDb();
      return await this.db.collection(dbCollection).countDocuments();
    } catch(error) {
      return 0;
    }
  }

  public async save(object: Savable, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const insertResult = await this.db.collection(dbCollection).updateOne(
        { _id: object.getId() },
        { $setOnInsert: object.serialize() },
        { upsert: true }
        );

        return insertResult.acknowledged;
      } catch(error) {
        throw new PersistenceError('An error occurred while saving to the database:' + error);
      }
  }

  public async saveMany(objects: Savable[], dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const insertResult = await this.db.collection(dbCollection).insertMany(objects.map(o => o.serialize()));
      
      if (insertResult.insertedCount !== objects.length) {
        throw new PersistenceError(`Not all objects were saved to the database. ${insertResult.insertedCount}/${objects.length} objects were saved.`);
      };

      return true;
    } catch(error) {
      
      throw new PersistenceError('An error occurred while saving to the database');
    }
  }
  
  public async get(id: string, dbCollection: DBCollections): Promise<Savable> {
    try {
      this.setDb();
      const queryResult = await this.db.collection(dbCollection).findOne({ _id: id });

      if (!queryResult) { 
        throw new PersistenceError(`No object with id ${id} was found in the database.`);
      }
      
      const resultObject = await this.createModelObjectFromQueryResult(queryResult, dbCollection);
      
      if (resultObject) {
        return resultObject
      }
      
      throw new Error();
    } catch (error) {
      console.log(error);
      throw new PersistenceError('An error occurred while getting an object from the database.');
    }
  }
  
  public async getWithFilter(filter: any, dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const resultArray = [];
      const queryResult = await this.db.collection(dbCollection).find(filter).toArray();
      
      if (!queryResult) {
        throw new PersistenceError(`No objects were found in the database.`);
      }
      
      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }
      
      if (resultArray.length > 0) {
        return resultArray;
      }
      
      throw new Error();
    } catch (error) {
      throw new PersistenceError(`An error occurred while getting objects from the database.`);
    }
  }

  public async getMany(ids: string[], dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const resultArray = [];
      const queryResult = await this.db.collection(dbCollection).find({ _id: { $in: ids } }).toArray();
      
      if (!queryResult) { 
        throw new PersistenceError(`No objects with ids ${ids} were found in the database.`);
      }
      
      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }
      
      if (resultArray.length > 0) {
        return resultArray
      }
      
      throw new Error();
    } catch (error) {
      throw new PersistenceError('An error occurred while getting objects from the database.');
    }
  }
  
  public async getRange(start: number, end: number, dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const queryResult = await this.db.collection(dbCollection).find({}).sort({ _id: 1}).skip(start).limit(end - start).toArray();
      
      if (!queryResult) { 
        throw new PersistenceError(`No objects were found in the database.`);
      }

      const resultArray = [];
      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }
      
      if (resultArray.length > 0) {
        return resultArray
      }
      
      throw new Error();
    } catch (error) {
      throw new PersistenceError('An error occurred while getting objects from the database.');
    }
  }
  
  public async getAll(dbCollection: DBCollections): Promise<Savable[]> {
    try {
      this.setDb();
      const queryResult = await this.db.collection(dbCollection).find({}).toArray();
      
      if (!queryResult) { 
        throw new PersistenceError(`No objects were found in the database.`);
      }
      
      const resultArray = [];
      for (let i = 0; i < queryResult.length; i++) {
        resultArray.push(await this.createModelObjectFromQueryResult(queryResult[i], dbCollection));
      }
      
      if (resultArray.length > 0) {
        return resultArray
      }
      
      throw new Error();
    } catch (error) {
      throw new PersistenceError('An error occurred while getting objects from the database.');
    }
  }
  
  public async update(id: string, object: Savable, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const updateResult = await this.db.collection(dbCollection).updateOne({ _id: id }, { $set: object.serialize() });
      
      if (updateResult.modifiedCount === 1) {
        return true
      }
      
      throw new PersistenceError(`An error occurred while updating the object with id ${id} in the database.`);
    } catch (error) {
      return false;
    }
  }

  public async updateField(id: string, field: string, value: any, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const updateResult = await this.db.collection(dbCollection).updateOne({ _id: id }, { $set: { [field]: value } });

      if (updateResult.modifiedCount === 1) {
        return true
      }

      throw new PersistenceError(`An error occurred while updating the object with id ${id} in the database.`);
    } catch (error) {
      return false;
    }
  }
  
  public async delete(id: string, dbCollection: DBCollections): Promise<boolean> {
    try {
      this.setDb();
      const deleteResult = await this.db.collection(dbCollection).deleteOne({ _id: id });
      
      if (deleteResult.deletedCount === 1) {
        return true
      }

      throw new PersistenceError(`An error occurred while deleting the object with id ${id} from the database.`);
    } catch (error) {
      return false;
    }
  }

  public async deleteAll(dbCollection: DBCollections): Promise<boolean> { 
    try {
      this.setDb();
      const deleteResult = await this.db.collection(dbCollection).deleteMany({});

      if (deleteResult.deletedCount > 0) {
        return true
      }

      throw new PersistenceError(`An error occurred while deleting all objects from the database.`);
    } catch (error) {
      return false;
    }
  }

  private async createModelObjectFromQueryResult(queryResult: any, dbCollection: DBCollections): Promise<Savable> { 
    switch (dbCollection) {
      case DBCollections.USERS:
        return User.deserialize(queryResult);
      case DBCollections.TEXT_SURVEYS:
        return TextSurvey.deserialize(queryResult);
      case DBCollections.SCALE_SURVEYS:
        return ScaleSurvey.deserialize(queryResult);
      case DBCollections.TELEMETRY:
        return Telemetry.deserialize(queryResult);
      default:
        break;
    }

    throw new Error('Unknown database collection');
  }

  private setDb() {
    if (!this.db) {
      this.db = app.get('database');
    }
  }
}
