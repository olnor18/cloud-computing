import 'reflect-metadata';
import 'dotenv/config';

import http from 'http';
import { MongoClient } from 'mongodb';
import { app } from './index';
import { getDbConnectionString } from './Config/DBSetup';
import { SocketService } from './Services/SocketService';
import UserController from './Controllers/UserController';
import DatabaseManager from './Common/DatabaseManager.interface';
import MongoDbmanager from './Wrappers/MongoDBManager';
import { userRoutes } from './Routes/UserRoutes';
import { authRoutes } from './Routes/AuthRoutes';
import { surveyRoutes } from './Routes/SurveyRoutes';
import { healthRouter } from './Routes/Health'
import TextSurveyController from './Controllers/TextSurveyController';
import ScaleSurveyController from './Controllers/ScaleSurveyController';
import { adaptionRoutes } from './Routes/AdaptionRoutes';
import TelemetryController from './Controllers/TelemetryController';
import { generateFileRoutes } from './Routes/GenerateFileRoutes';

let databaseManager: DatabaseManager;

const initializeControllers = () => {
    app.set('UsersController', new UserController(databaseManager)); // TODO: Add controllers for surveys
    app.set('TextSurveyController', new TextSurveyController(databaseManager));
    app.set('ScaleSurveyController', new ScaleSurveyController(databaseManager));
    app.set('TelemetryController', new TelemetryController(databaseManager));
}

MongoClient.connect(getDbConnectionString(), async (err, client) => {
    if (err || !client) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        try {
            const server = http.createServer(app);
            const port = process.env.PORT;
            
            server.listen(port, async () => {
                const db = client.db(process.env.DB_NAME);
                app.set('database', db);
    
                databaseManager = new MongoDbmanager();
                initializeControllers();
    
                app.set('socketService', new SocketService(server));
            });
        } catch (error) {
            console.log('Error while starting server:', error);
        }
    }
});

// Initialize routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/surveys', surveyRoutes);
app.use('/adaptions', adaptionRoutes);
app.use('/health', healthRouter)
app.use('/files/',generateFileRoutes)
