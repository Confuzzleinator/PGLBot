require('dotenv').config()
const game = require('./game')
const Discord = require('discord.js')
const discordOutput = require('./discord_output')
const Team = game.Team
const Player = game.Player
const Game = game.Game

const client = new Discord.Client()
console.log(process.env.DISCORD_BOT_KEY)
client.login(process.env.DISCORD_BOT_KEY)
const prefix = '!'
const defaultDelay = 2000

let t1, t2

client.on('ready', () => {
  console.log('Bot intialized.')

  // Sample teams
  t1 = new Team(
    'Ghost Gaming',
    'GG',
    [new Player('AlphaKep', 50, 0), new Player('Gimmick', 60, 1), new Player('SquishyMuffinz', 70, 2)],
    client.guilds.cache
      .get('768175058102255616')
      .emojis.cache.find((emoji) => emoji.name == 'GG')
      .toString(),
    client.guilds.cache
      .get('768175058102255616')
      .roles.cache.find((role) => role.name == 'Ghost Gaming')
      .toString(),
  )

  t2 = new Team(
    'Echo Fox',
    'EF',
    [new Player('Andy', 50, 0), new Player('hec', 60, 1), new Player('ClayX', 71, 2)],
    client.guilds.cache
      .get('768175058102255616')
      .emojis.cache.find((emoji) => emoji.name == 'EF')
      .toString(),
    client.guilds.cache
      .get('768175058102255616')
      .roles.cache.find((role) => role.name == 'Echo Fox')
      .toString(),
  )
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
    let wins = [0, 0]
    if (args[0] == undefined) args[0] = defaultDelay
    if (args[1] == undefined) args[1] = 3
    let gameNum = 0
    let seriesEvents = []
    seriesEvents.push(t1.emoji + ' vs ' + t2.emoji + ' ' + t1.role + ' ' + t2.role)
    while (wins[0] < args[1] && wins[1] < args[1]) {
      ++gameNum
      let game = new Game(t1, t2)
      game.events.push(
        '__**Game ' + gameNum + ' | ' + t1.emoji + ' (' + wins[0] + ' - ' + wins[1] + ') ' + t2.emoji + '**__',
      )
      game.sim()
      seriesEvents = seriesEvents.concat(game.events)

      if (game.winner == t1) {
        wins[0]++
      } else {
        wins[1]++
      }
    }
    seriesEvents.push('Series Result: ' + t1.emoji + ' (' + wins[0] + ' - ' + wins[1] + ') ' + t2.emoji)
    discordOutput.delayed(seriesEvents, args[0], message.channel)
  }
})
