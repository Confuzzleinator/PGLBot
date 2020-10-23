const game = require('./game')
const fs = require('fs')
const Discord = require('discord.js')
const path = require('path')
const discordOutput = require('./discord_output')
const Team = game.Team
const Player = game.Player
const Game = game.Game

const client = new Discord.Client()
const prefix = '!'
const defaultDelay = 2000

// Sample teams
let t1 = new Team('Ghost Gaming', ':GG:', [
  new Player('AlphaKep', 50, 0),
  new Player('Gimmick', 60, 0),
  new Player('SquishyMuffinz', 70, 0),
])
let t2 = new Team('Echo Fox', ':FOX:', [new Player('Andy', 50, 0), new Player('hec', 60, 1), new Player('ClayX', 71, 2)])

client.on('ready', () => {
  console.log('Bot intialized.')
})

client.on('message', (message) => {
  // Ignore messages that don't start with the prefix or are sent by the bot
  if (!message.content.startsWith(prefix) || message.author.bot) return
  const args = message.content.slice(prefix.length).trim().split(' ')
  const command = args.shift().toLowerCase()

  if (command == 'sim') {
    // If no argument, set it to default
    if (args[0] == undefined) {
      args[0] = defaultDelay
    }

    let game = new Game(t1, t2)
    game.sim()
    discordOutput.delayed(game.events, args[0], message.channel)
  } else if (command == 'series') {
    let wins = [0, 0]f
    if (args[0] == undefined) args[0] = defaultDelay
    if (args[1] == undefined) args[1] = 3
    let gameNum = 0
    let seriesEvents = []
    game.events.push(t1.abbrev + ' vs ' + t2.abbrev + ' @' + t1.name + ' @' + t2.name
      )
    while (wins[0] < args[1] && wins[1] < args[1]) {
      ++gameNum
      let game = new Game(t1, t2)
      game.events.push(
        '**Game ' + gameNum + ' | ' + t1.abbrev + ' (' + wins[0] + ' - ' + wins[1] + ') ' + t2.abbrev + '**',
      )
      game.sim()
      seriesEvents = seriesEvents.concat(game.events)

      if (game.winner == t1) {
        wins[0]++
      } else {
        wins[1]++
      }
    }
    seriesEvents.push('Series Result: ' + t1.abbrev + ' (' + wins[0] + ' - ' + wins[1] + ') ' + t2.abbrev)
    discordOutput.delayed(seriesEvents, args[0], message.channel)
  }
})

fs.readFile(path.join(__dirname, '..', 'token.txt'), (err, data) => {
  if (err) return console.log(err)
  client.login(data.toString())
})
