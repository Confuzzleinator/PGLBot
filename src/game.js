// Game Simulation Code below.
let scoringOdds = 0.007
let minimumOdds = 0.001
let triplePlaystylePenalty = 30
let doublePlaystylePenalty = 10

function Player(name, rating, playstyle) {
  this.name = name
  this.rating = rating
  this.playstyle = playstyle // 0: striker, 1: guardian, 2: playmaker, 3: all-around
  this.goals = 0
}

function Team(name, abbrev, players, emoji, role) {
  this.name = name
  this.abbrev = abbrev
  this.players = players
  this.goals = 0
  this.emoji = emoji
  this.role = role

  // Calculate team overall rating
  let total = 0
  for (let i = 0; i < this.players.length; ++i) {
    total += this.players[i].rating
  }

  if (
    this.players[0].playstyle != 3 &&
    this.players[0].playstyle == this.players[1].playstyle &&
    this.players[0].playstyle == this.players[2].playstyle
  ) {
    total -= triplePlaystylePenalty
  } else if (
    this.players[0].playstyle != 3 &&
    (this.players[0].playstyle == this.players[1].playstyle || this.players[0].playstyle == this.players[2].playstyle)
  ) {
    total -= doublePlaystylePenalty
  } else if (this.players[1].playstyle != 3 && this.players[1].playstyle == this.players[2].playstyle) {
    total -= doublePlaystylePenalty
  }

  this.rating = total

  this.playerScoreChance = (playerIndex) => {
    let player = this.players[playerIndex]
    let ratingTotal = 0
    for (let i = 0; i < this.players.length; ++i) ratingTotal += this.players[i].rating
    if (player.playstyle == 0) {
      return player.rating + ratingTotal / 10
    } else if (player.playstyle == 1) {
      return player.rating - ratingTotal / 10
    } else {
      return player.rating
    }
  }
}

function scoreEvent(team, player, time) {
  let formattedTime = ''
  if (time < 0) {
    formattedTime += '+'
    time = Math.abs(time)
  }
  formattedTime += Math.floor(time / 60)
  formattedTime += ':'
  if (time % 60 < 10) formattedTime += '0'
  formattedTime += time % 60
  return formattedTime + ' - ' + player + ' has scored for ' + team
}

function score(team, time) {
  team.goals++
  let ratingAmount = team.playerScoreChance(0) + team.playerScoreChance(1) + team.playerScoreChance(2)
  let rand = Math.floor(Math.random() * ratingAmount)
  if (rand < team.playerScoreChance(0)) {
    team.players[0].goals++
    return scoreEvent(team.emoji, team.players[0].name, time)
  } else if (rand < team.playerScoreChance(0) + team.playerScoreChance(1)) {
    team.players[1].goals++
    return scoreEvent(team.emoji, team.players[1].name, time)
  } else {
    team.players[2].goals++
    return scoreEvent(team.emoji, team.players[2].name, time)
  }
}

function Game(t1, t2) {
  this.t1 = t1
  this.t2 = t2
  this.events = []

  this.t1.goals = 0
  this.t2.goals = 0

  this.sim = () => {
    let time = 299
    let t1Odds = scoringOdds + (this.t1.rating - t2.rating) * 0.00005
    let t2Odds = scoringOdds + (t2.rating - this.t1.rating) * 0.00005

    if (t1Odds < minimumOdds) t1Odds = minimumOdds
    if (t2Odds < minimumOdds) t2Odds = minimumOdds

    while (time > -1) {
      let rand = Math.random()
      if (rand < t1Odds) {
        this.events.push(score(t1, time))
      } else if (rand < t1Odds + t2Odds) {
        this.events.push(score(t2, time))
      }

      --time
    }

    if (this.t1.goals == t2.goals) {
      this.events.push('OVERTIME')
      let overtime = 0
      while (true) {
        let rand = Math.random()
        if (rand < t1Odds) {
          this.events.push(score(t1, -overtime))
          break
        } else if (rand < t1Odds + t2Odds) {
          this.events.push(score(t2, -overtime))
          break
        }
        ++overtime
      }
    }

    if (this.t1.goals > t2.goals) {
      this.winner = t1
    } else {
      this.winner = t2
    }
    this.events.push(this.t1.emoji + ': ' + this.t1.goals + ' ' + t2.emoji + ': ' + t2.goals)
  }
}

exports.Team = Team
exports.Player = Player
exports.Game = Game
