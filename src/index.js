require('dotenv').config()
const game = require('./game')
const Discord = require('discord.js')
const discordOutput = require('./discord_output')
const database = require('./services/database')
const sheets = require('./services/sheets')
const Team = game.Team
const Series = game.Series

const client = new Discord.Client()
client.login(process.env.DISCORD_BOT_KEY)
const prefix = '!'
const defaultDelay = 2000
const maxDelay = 20000
const minDelay = 2000
const defaultGames = 3
const minGames = 1
const maxGames = 10
const allowedRoles = ['Commissioner', 'Moderator']
const noPermissionMessage = "You don't have permission to do that "

let t1, t2
let queue = []
let seriesCounter = 0

client.on('ready', () => {
  sheets.authenticate()
  client.user.setActivity('Minkz FTW')
  console.log('Bot intialized.')
})

client.on('message', async (message) => {
  // Ignore messages that don't start with the prefix or are sent by the bot
  if (!message.content.startsWith(prefix) || message.author.bot) return
  const args = message.content.slice(prefix.length).trim().split(' ')
  const command = args.shift().toLowerCase()
  let allowed = false
  for (let i = 0; i < allowedRoles.length; ++i) {
    message.member.roles.cache.each((role) => {
      if (role.name == allowedRoles[i]) allowed = true
    })
  }

  if (command == 'series') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    let t1Data = await database.getTeam(args[0])
    let t2Data = await database.getTeam(args[1])
    if (args[2] == undefined) args[2] = defaultDelay
    if (args[3] == undefined) args[3] = 3
    t1 = new Team(
      t1Data.name,
      t1Data.abbreviation,
      await database.getPlayers(t1Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t1Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t1Data.name).toString(),
    )
    t2 = new Team(
      t2Data.name,
      t2Data.abbreviation,
      await database.getPlayers(t2Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t2Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t2Data.name).toString(),
    )
    let s = new Series(t1, t2, args[2], args[3], true)
    queue.push(s)
  } else if (command == 'load') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    database.insertTeams()
  } else if (command == 'run') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    for (let i = 0; i < queue.length; ++i) {
      queue[i].sim()
      for (let j = 0; j < queue[i].games.length; ++j) {
        database.addGame(queue[i].games[j], seriesCounter)
      }
      await discordOutput.delayed(queue[i].events, queue[i].delay, message.channel)
      ++seriesCounter
    }
  } else if (command == 'sim') {
    let t1Data = await database.getTeam(args[0])
    let t2Data = await database.getTeam(args[1])
    if (args[2] == undefined) {
      args[2] = defaultDelay
    } else if (args[2] < minDelay) {
      message.channel.send('TOO FAST you turd. Delay changed to ' + minDelay + 'ms ' + message.member.toString())
      args[2] = minDelay
    } else if (args[2] > maxDelay) {
      message.channel.send('TOO SLOW you turd. Delay changed to ' + maxDelay + 'ms ' + message.member.toString())
      args[2] = maxDelay
    }

    if (args[3] == undefined) {
      args[3] = defaultGames
    } else if (args[3] < minGames) {
      message.channel.send(
        "You can't play less than one game, no matter how hard you try. Games changed to " +
          minGames +
          ' ' +
          message.member.toString(),
      )
      args[3] = minGames
    } else if (args[3] > maxGames) {
      message.channel.send(
        'Too many freaking games, trying to crash me naughty boy? Games changed to ' +
          maxGames +
          ' ' +
          message.member.toString(),
      )
      args[3] = maxGames
    }
    t1 = new Team(
      t1Data.name,
      t1Data.abbreviation,
      await database.getPlayers(t1Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t1Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t1Data.name).toString(),
    )
    t2 = new Team(
      t2Data.name,
      t2Data.abbreviation,
      await database.getPlayers(t2Data.id),
      message.guild.emojis.cache.find((emoji) => emoji.name == t2Data.abbreviation).toString(),
      message.guild.roles.cache.find((role) => role.name == t2Data.name).toString(),
    )
    let s = new Series(t1, t2, args[2], args[3], false)
    s.sim()
    s.events.push(discordOutput.createSeriesSummary(s))
    discordOutput.delayed(s.events, s.delay, message.channel)
  } else if (command == 'export') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    await sheets.addGames()
    database.clearGames()
  } else if (command == 'list') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    if (queue.length < 1) return message.channel.send('The queue is empty.')
    let list = []
    for (let i = 0; i < queue.length; ++i) {
      list.push(queue[i].t1.abbrev + ' vs ' + queue[i].t2.abbrev)
    }
    message.channel.send(list)
  } else if (command == 'clear') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    queue = []
    database.clearGames()
  } else if (command == 'drop') {
    if (!allowed) return message.channel.send(noPermissionMessage + message.member.toString())
    if (queue.length < 1) return message.channel.send('The queue is already empty, nothing to drop.')
    let removed = queue.pop()
    message.channel.send('Removed ' + removed.t1.abbrev + ' vs ' + removed.t2.abbrev + ' from the queue.')
  }
})
