import { Request, Response } from 'express';
import Teams from '../database/models/Teams';
import Matches from '../database/models/Matches';

class MatchesController {
  private match;

  constructor() {
    this.match = Matches;
  }

  public getAllMatches = async (req: Request, res: Response) => {
    if (req.query.inProgress === 'true') {
      return this.getMatchesInProgress(req, res);
    }
    if (req.query.inProgress === 'false') {
      return this.getEndedMatches(req, res);
    }
    const matches = await this.match.findAll({
      include: [
        { model: Teams, as: 'teamHome', attributes: { exclude: ['id'] } },
        { model: Teams, as: 'teamAway', attributes: { exclude: ['id'] } },
      ],
    });
    return res.status(200).json(matches);
  };

  public getMatchesInProgress = async (req: Request, res: Response) => {
    const matches = await this.match.findAll({
      where: { inProgress: true },
      include: [
        {
          model: Teams,
          as: 'teamHome',
          attributes: { exclude: ['id'] },
        },
        {
          model: Teams,
          as: 'teamAway',
          attributes: { exclude: ['id'] },
        },
      ],
    });
    return res.status(200).json(matches);
  };

  public getEndedMatches = async (req: Request, res: Response) => {
    const matches = await this.match.findAll({
      where: { inProgress: false },
      include: [
        {
          model: Teams,
          as: 'teamHome',
          attributes: { exclude: ['id'] },
        },
        {
          model: Teams,
          as: 'teamAway',
          attributes: { exclude: ['id'] },
        },
      ],
    });
    return res.status(200).json(matches);
  };

  public addMatch = async (req: Request, res: Response) => {
    if (req.body.homeTeam === req.body.awayTeam) {
      return res.status(401).json({
        message: 'It is not possible to create a match with two equal teams' });
    }
    const [homeTeam, awayTeam] = await Promise.all([
      Teams.findOne({ where: { id: req.body.homeTeam } }),
      Teams.findOne({ where: { id: req.body.awayTeam } })]);
    if (!homeTeam || !awayTeam) {
      return res.status(404).json({ message: 'There is no team with such id!' });
    }
    const match = await this.match.create({
      homeTeam: req.body.homeTeam,
      homeTeamGoals: req.body.homeTeamGoals,
      awayTeam: req.body.awayTeam,
      awayTeamGoals: req.body.awayTeamGoals,
      inProgress: req.body.inProgress,
    });
    return res.status(201).json(match);
  };

  public endMatch = async (req: Request, res: Response) => {
    const match = await this.match.update(
      { inProgress: false },
      {
        where: { id: req.params.id },
      },
    );
    return res.status(200).json({ id: match });
  };

  public updateMatch = async (req: Request, res: Response) => {
    const match = await this.match.update(req.body, {
      where: { id: req.params.id },
    });
    return res.status(200).json({ id: match, ...req.body });
  };
}

export default MatchesController;
