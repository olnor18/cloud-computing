import express, { Request, Response } from "express";
import { app } from "..";
import UserController from "../Controllers/UserController";
import User from "../Models/User";
import IncomingRequestError from './../Errors/IncomingRequestError';

export const userRoutes = express.Router();

/**
 * Expects a JSON object in the body of the request with the following format:
 * {
 *  start: number,
 *  end: number
 * }
 * Start and end are the indexes of the range of users to return.
 * Start is inclusive, end is exclusive.
 */
userRoutes.get("/range", (req: Request, res: Response) => {
    try {
        if (isNaN(req.body.start) || isNaN(req.body.end)) throw new IncomingRequestError("The start and end parameters must be numbers");
        if (req.body.start < 0 || req.body.end < 0) throw new IncomingRequestError("The start and end parameters must be positive numbers");

        const usersController = app.get('UsersController') as UserController;
        usersController.getRange(req.body.start, req.body.end).then((users) => {
            if (users && users.length > 0) {
                return res.send(users);
            } else {
                return res.status(404).send(`No users found. Current amount of users: ${countUsers()}`);
            }
        
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch (error) {
        if (error instanceof IncomingRequestError) {
            return res.status(400).send(error.message);
        } else {
            return res.status(500).send(error);
        }
    }
});

userRoutes.get("/all", (req, res) => {
    try {
        const usersController = app.get('UsersController') as UserController;
        usersController.getAll().then((users) => {
            if (users && users.length > 0) {
                return res.send(users);
            } else {
                return res.status(404).send("No users found");
            }
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {

    }
});

userRoutes.get("/count", (req, res) => {
    try {
        countUsers().then((count) => {
            return res.send({
                userCount: count
            });
        }).catch(() => {
            return res.sendStatus(500);
        });
    } catch {
        return res.sendStatus(500);
    }
});

userRoutes.get("/:id", (req, res) => {
    const userId = req.params.id;
    buildUserReport(userId).then((user) => {
        if (user) {
            return res.send(user);
        } else {
            return res.status(404).send("User not found");
        }
    }).catch(() => {
        return res.sendStatus(500);
    });
});

// Connect user
userRoutes.post('/connect', async (req: Request, res: Response) => {
    try {
        const usersController = app.get("UsersController") as UserController;
        const user = new User();

        const saveResult = await usersController.create(user);
        if (!saveResult) throw new Error('Failed to save user');

        return res.status(201).send({
            userId: user.getId()
        });
    } catch (error) {
        if (error instanceof IncomingRequestError) {
            return res.status(400).send('Request failed: ' + error.message);
        } 

        return res.status(500).send();
    }
});

const buildUserReport = async (userId: string): Promise<User | undefined> => {
    try {
        const userController = app.get('UsersController') as UserController;    
        const user = await userController.get(userId);
    
        return user;
    } catch {
        return undefined;
    }
};

const countUsers = async (): Promise<number> => {
    try {
        const userController = app.get('UsersController') as UserController;
        return await userController.count();
    } catch (error) {
        throw error;
    }
};
