require('dotenv').config()
const game = require('./game')
const Discord = require('discord.js')
const discordOutput = require('./discord_output')
const database = require('./services/database')
const Team = game.Team
const Player = game.Player
const Game = game.Game

const client = new Discord.Client()
client.login(process.env.DISCORD_BOT_KEY)
const prefix = '!'
const defaultDelay = 2000

let t1, t2

client.on('ready', () => {
  console.log('Bot intialized.')
})

client.on('message', async (message) => {
  // Ignore messages that don't start with the prefix or are sent by the bot
  if (!message.content.startsWith(prefix) || message.author.bot) return
  const args = message.content.slice(prefix.length).trim().split(' ')
  const command = args.shift().toLowerCase()

  if (command == 'series') {
    let t1Data = await database.getTeam(args[0])
    let t2Data = await database.getTeam(args[1])
    let t1 = new Team(
      t1Data.name,
      t1Data.abbreviation,
      await database.getPlayers(t1Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t1Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t1Data.name).toString(),
    )
    let t2 = new Team(
      t2Data.name,
      t2Data.abbreviation,
      await database.getPlayers(t2Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t2Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t2Data.name).toString(),
    )
    let wins = [0, 0]
    if (args[2] == undefined) args[2] = defaultDelay
    if (args[3] == undefined) args[3] = 3
    let gameNum = 0
    let seriesEvents = []
    seriesEvents.push(t1.emoji + ' vs ' + t2.emoji + ' ' + t1.role + ' ' + t2.role)
    while (wins[0] < args[3] && wins[1] < args[3]) {
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
    discordOutput.delayed(seriesEvents, args[2], message.channel)
  } else if (command == 'load') {
    database.insertTeams()
  }
})
