import { Request, Response } from 'express';
import Team from '../database/models/Teams';

class TeamsController {
  private team;

  constructor() {
    this.team = Team;
  }

  public getAllTeams = async (req: Request, res: Response) => {
    const teams = await this.team.findAll();
    return res.status(200).json(teams);
  };

  public getTeamById = async (req: Request, res: Response) => {
    const team = await this.team.findOne({ where: { id: req.params.id } });
    return res.status(200).json(team);
  };
}

export default TeamsController;
