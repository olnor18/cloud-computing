import express, {Request, Response } from "express"
import jwt from "jsonwebtoken"
import {db} from "../MongooseModels"
import IncomingRequestError from "../Errors/IncomingRequestError";
import bcrypt from "bcrypt"
import config from "../Config/auth.config"

export const authRoutes = express.Router();

const ROLES = db.ROLES;
const Role = db.role;
const User = db.user;

authRoutes.post('/signup', (req: Request, res: Response) => {
  try {
    if (!req.body.email) throw new IncomingRequestError("The email parameter must be provided");
    if (!req.body.roles) throw new IncomingRequestError("The roles parameter must be provided");
    if (!req.body.password) throw new IncomingRequestError("The password parameter must be provided");

    // Check dupolicate email
    const u = User.findOne({
      email: req.body.email
    }).exec((err:any, user:any) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      if (user) {
        return res.status(400).send({ message: "Failed! Email is already in use!" });
      }
    });

    // Check role is valid
    if (req.body.roles) {
      for (let i = 0; i < req.body.roles.length; i++) {
        if (!ROLES.includes(req.body.roles[i])) {
          return res.status(400).send({
            message: `Failed! Role ${req.body.roles[i]} does not exist!`
          });
        }
      }
    }

  } catch (error) {
    if (error instanceof IncomingRequestError) {
      return res.status(400).send(error.message);
    } else {
      return res.status(500).send(error);
    }
  }

  // Signup user
  const user = new User({
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });
  user.save((err:any, user:any) => {
    if (err) {
      return res.status(500).send({ message: err });
    }
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err:any, roles:any) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          user.roles = roles.map((role:any) => role._id);
          user.save((err:any) => {
            if (err) {
             return res.status(500).send({ message: err });
            }
            return res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err:any, role:any) => {
        if (err) {
          return res.status(500).send({ message: err });
        }
        user.roles = [role._id];
        user.save((err:any) => {
          if (err) {
            return res.status(500).send({ message: err });
          }
          return res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
})

authRoutes.post("/signin" , (req: Request, res: Response) => {
  try {
    User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .exec((err:any, user:any) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      const authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      return res.status(200).send({
        id: user._id,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
  } catch (error) {
    if (error instanceof IncomingRequestError) {
      return res.status(400).send(error.message);
    } else {
      return res.status(500).send(error);
    }
  }
});