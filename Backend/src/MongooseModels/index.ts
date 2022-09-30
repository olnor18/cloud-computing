import mongoose from 'mongoose';
import { getDbConnectionString } from '../Config/DBSetup';
import { Role } from './role.model';
import { User } from './user.model'

mongoose.Promise = global.Promise;

export const db:any = {};

db.mongoose = mongoose;
db.user = User
db.role = Role
db.ROLES = ["user", "admin", "moderator"];

db.mongoose
  .connect(getDbConnectionString(), {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    initial();
  })
  .catch((err:any) => {
    console.error("Connection error", err);
    process.exit();
  });


  function initial() {
    Role.estimatedDocumentCount((err:any, count:any) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
        });
        new Role({
          name: "moderator"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
        });
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
        });
      }
    });
  }