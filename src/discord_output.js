const Discord = require('discord.js')

async function delayed(events, delay, channel) {
  let counter = 0
  let promise = new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      channel.send(events[counter])
      counter++
      if (counter >= events.length) {
        clearInterval(interval)
        resolve()
      }
    }, delay)
  })

  return promise
}

function createSeriesSummary(series) {
  let t1Goals = 0
  let t2Goals = 0
  let t1PlayerGoals = [0, 0, 0]
  let t2PlayerGoals = [0, 0, 0]
  for (let i = 0; i < series.games.length; ++i) {
    for (let j = 0; j < series.games[i].t1.players.length; ++j) {
      t1PlayerGoals[j] += series.games[i].t1.players[j].goals
      t2PlayerGoals[j] += series.games[i].t2.players[j].goals
      t1Goals += series.games[i].t1.players[j].goals
      t2Goals += series.games[i].t2.players[j].goals
    }
  }
  const embed = new Discord.MessageEmbed()
    .setColor('#67d339')
    .setTitle(
      series.t1.emoji +
        series.t1.name +
        ' ' +
        series.wins[0] +
        ' - ' +
        series.wins[1] +
        ' ' +
        series.t2.emoji +
        series.t2.name,
    )
    .setDescription(
      bold('Team Goals') +
        '\n' +
        series.t1.emoji +
        ' ' +
        t1Goals +
        '\n' +
        series.t2.emoji +
        ' ' +
        t2Goals +
        '\n\n' +
        bold('Player Goals') +
        '\n' +
        series.t1.players[0].name +
        ': ' +
        t1PlayerGoals[0] +
        '\n' +
        series.t1.players[1].name +
        ': ' +
        t1PlayerGoals[1] +
        '\n' +
        series.t1.players[2].name +
        ': ' +
        t1PlayerGoals[2] +
        '\n' +
        series.t2.players[0].name +
        ': ' +
        t2PlayerGoals[0] +
        '\n' +
        series.t2.players[1].name +
        ': ' +
        t2PlayerGoals[1] +
        '\n' +
        series.t2.players[2].name +
        ': ' +
        t2PlayerGoals[2],
    )

  return embed
}

function bold(text, isBold) {
  if (isBold) {
    return '**' + text + '**'
  } else {
    return text
  }
}
function bold(text) {
  return '**' + text + '**'
}

exports.delayed = delayed
exports.createSeriesSummary = createSeriesSummary
