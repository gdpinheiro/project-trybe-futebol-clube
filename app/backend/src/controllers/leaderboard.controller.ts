import { Request, Response } from 'express';
import Teams from '../database/models/Teams';
import Matches from '../database/models/Matches';

type Acc = { totalVictories: 0; totalDraws: 0; totalLosses: 0 };

type Srt = {
  totalPoints: number;
  goalsBalance: number;
  goalsFavor: number;
};

class LeaderboardController {
  public static sortLeaderboard = (a: Srt, b: Srt) => {
    if (b.totalPoints === a.totalPoints && b.goalsBalance === a.goalsBalance) {
      return b.goalsFavor - a.goalsFavor;
    }
    if (b.totalPoints === a.totalPoints) {
      return b.goalsBalance - a.goalsBalance;
    }
    return b.totalPoints - a.totalPoints;
  };

  public static reduceVictoriesHelper(acc: Acc, match: Matches) {
    return {
      totalVictories:
        match.homeTeamGoals < match.awayTeamGoals
          ? acc.totalVictories + 1
          : acc.totalVictories,
      totalDraws:
        match.homeTeamGoals === match.awayTeamGoals
          ? acc.totalDraws + 1
          : acc.totalDraws,
      totalLosses:
        match.homeTeamGoals > match.awayTeamGoals
          ? acc.totalLosses + 1
          : acc.totalLosses,
    };
  }

  public static reduceVictories(matches: Matches[], team: Teams) {
    const victories = matches.reduce((acc, match: Matches) => {
      if (match.homeTeam === team.id) {
        return {
          totalVictories:
              match.homeTeamGoals > match.awayTeamGoals
                ? acc.totalVictories + 1 : acc.totalVictories,
          totalDraws:
              match.homeTeamGoals === match.awayTeamGoals
                ? acc.totalDraws + 1 : acc.totalDraws,
          totalLosses:
              match.homeTeamGoals < match.awayTeamGoals
                ? acc.totalLosses + 1 : acc.totalLosses,
        };
      } return LeaderboardController.reduceVictoriesHelper(acc as Acc, match);
    }, { totalVictories: 0, totalDraws: 0, totalLosses: 0 });
    return {
      ...victories,
      totalPoints: victories.totalDraws + victories.totalVictories * 3 };
  }

  public static reduceGoals(matches: Matches[], team: Teams) {
    const goals = matches.reduce(
      (acc, match: Matches) => {
        if (match.homeTeam === team.id) {
          return {
            goalsFavor: acc.goalsFavor + match.homeTeamGoals,
            goalsOwn: acc.goalsOwn + match.awayTeamGoals,
          };
        }
        return {
          goalsFavor: acc.goalsFavor + match.awayTeamGoals,
          goalsOwn: acc.goalsOwn + match.homeTeamGoals,
        };
      },
      { goalsFavor: 0, goalsOwn: 0 },
    );
    return { ...goals, goalsBalance: goals.goalsFavor - goals.goalsOwn };
  }

  public static mapLeaderboardHome(matches: Matches[], teams: Teams[]) {
    const leaderboard = teams.map((team: Teams) => {
      const teamMatches = matches.filter((match: Matches) =>
        match.homeTeam === team.id && !match.inProgress);
      const goals = LeaderboardController.reduceGoals(teamMatches, team);
      const victories = LeaderboardController.reduceVictories(teamMatches, team);
      const finalObject = {
        name: team.teamName,
        totalGames: teamMatches.length,
        ...goals,
        ...victories,
        efficiency: ((victories.totalPoints / (teamMatches.length * 3)) * 100).toFixed(2),
      };
      if (Number(finalObject.efficiency) % 1 === 0) {
        finalObject.efficiency = Number(finalObject.efficiency).toFixed(0);
      }
      return finalObject;
    });
    return leaderboard;
  }

  public static async getLeaderboardHome(req: Request, res: Response) {
    const matches = await Matches.findAll();
    const teams = await Teams.findAll();
    const leaderboardHome = LeaderboardController.mapLeaderboardHome(
      matches,
      teams,
    );
    const sortedLeaderboard = leaderboardHome.sort(
      LeaderboardController.sortLeaderboard,
    );
    return res.status(200).json(sortedLeaderboard);
  }

  public static mapLeaderboardAway(matches: Matches[], teams: Teams[]) {
    const leaderboard = teams.map((team: Teams) => {
      const teamMatches = matches.filter((match: Matches) =>
        match.awayTeam === team.id && !match.inProgress);
      const goals = LeaderboardController.reduceGoals(teamMatches, team);
      const victories = LeaderboardController.reduceVictories(teamMatches, team);
      const finalObject = {
        name: team.teamName,
        totalGames: teamMatches.length,
        ...goals,
        ...victories,
        efficiency: ((victories.totalPoints / (teamMatches.length * 3)) * 100).toFixed(2),
      };
      if (Number(finalObject.efficiency) % 1 === 0) {
        finalObject.efficiency = Number(finalObject.efficiency).toFixed(0);
      }
      return finalObject;
    });
    return leaderboard;
  }

  public static async getLeaderboardAway(req: Request, res: Response) {
    const matches = await Matches.findAll();
    const teams = await Teams.findAll();
    const leaderboardAway = LeaderboardController.mapLeaderboardAway(
      matches,
      teams,
    );
    const sortedLeaderboard = leaderboardAway.sort(
      LeaderboardController.sortLeaderboard,
    );
    return res.status(200).json(sortedLeaderboard);
  }
}
export default LeaderboardController;
