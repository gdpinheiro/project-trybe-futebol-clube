import { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { sign, verify } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import User from '../database/models/User';

class LoginController {
  private user;

  private static jwtEvaluationKey = 'jwt.evaluation.key';

  token: string;
  static token: string;

  constructor() {
    this.user = User;
  }

  public static checkRequestBody(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'All fields must be filled',
      });
    }
    next();
  }

  private static createJWT = async (userData: User | null) => {
    const secret = readFileSync(LoginController.jwtEvaluationKey).toString(
      'utf8',
    );

    const username = userData?.getDataValue('username');
    const email = userData?.getDataValue('email');
    const password = userData?.getDataValue('password');
    const role = userData?.getDataValue('role');

    return sign({ username, email, password, role }, secret, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });
  };

  private static decodeJWT = (token: string) => {
    const secret = readFileSync(LoginController.jwtEvaluationKey).toString(
      'utf8',
    );

    return verify(token, secret) as User;
  };

  private static decodeHash = async (email: string, password: string) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return false;
    }
    const retrievedPassword = user?.getDataValue('password');

    return bcrypt.compare(password, retrievedPassword);
  };

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const decodedPassword = await LoginController.decodeHash(email, password);

    const user = await User.findOne({ where: { email } });

    if (decodedPassword) {
      res.status(200).json({
        user: {
          id: user?.id,
          username: user?.username,
          role: user?.role,
          email: user?.email,
        },
        token: await LoginController.createJWT(user),
      });
    } else {
      res.status(401).json({ message: 'Incorrect email or password' });
    }
  };

  public validate = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      const validation = LoginController.decodeJWT(token);
      return res.status(200).json(validation.role);
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid' });
    }
  };
}

export default LoginController;
