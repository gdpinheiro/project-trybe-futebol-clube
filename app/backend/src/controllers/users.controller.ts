import { NextFunction, Request, Response } from 'express';
// import Joi = require('joi');
import User from '../database/models/User';

class UsersController {
  constructor(private userModel = new User()) {}
  emptyFunctionTemplate = (req: Request, res: Response, next: NextFunction) => {
    try {
      return User;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
