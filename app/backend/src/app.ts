import * as express from 'express';
import * as bodyParser from 'body-parser';

import LoginController from './controllers/login.controller';
import TeamsController from './controllers/teams.controller';
import MatchesController from './controllers/matches.controller';
// import LeaderboardController from './controllers/leaderboard.controller';

const loginController = new LoginController();
const teamsController = new TeamsController();
const matchesController = new MatchesController();
// const leaderboardController = new LeaderboardController();

class App {
  public app: express.Express;

  constructor() {
    this.app = express();
    this.config();
  }

  private config(): void {
    const accessControl: express.RequestHandler = (_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT,PATCH');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    };
    this.app.use(accessControl);
    this.app.use(bodyParser.json());
    this.app.post('/login', LoginController.checkRequestBody, loginController.login);
    this.app.get('/login/validate', loginController.validate);
    this.app.get('/teams', teamsController.getAllTeams);
    this.app.get('/teams/:id', teamsController.getTeamById);
    this.app.get('/matches', matchesController.getAllMatches);
    this.app.post('/matches', matchesController.addMatch);
    this.app.patch('/matches/:id', matchesController.updateMatch);
    this.app.patch('/matches/:id/finish', matchesController.endMatch);
    // this.app.get('/leaderboard/home', LeaderboardController.getHomeLeaderboard);
    // this.app.get('/leaderboard/away', LeaderboardController.getAwayLeaderboard);
    // this.app.get('/leaderboard', LeaderboardController.getLeaderboard);
  }

  public start(PORT: string | number): void {
    this.app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  }
}

export { App };

export const { app } = new App();
