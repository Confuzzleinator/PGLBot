const { GoogleSpreadsheet } = require('google-spreadsheet')
const path = require('path')
const database = require('./database')

const doc = new GoogleSpreadsheet(process.env.SHEET_ID)

async function authenticate() {
  await doc.useServiceAccountAuth(require(path.join(__dirname, '..', '..', 'google.creds.json')))
  await doc.loadInfo()
  return Promise.resolve()
}

async function addGames(game) {
  const sheet = await doc.sheetsByTitle[process.env.SHEET_NAME]
  let results = await database.getGames()
  for (let i = 0; i < results[0].length; ++i) {
    let r = results[0][i]
    let t1Goals = r.t1Goals1 + r.t1Goals2 + r.t1Goals3
    let t2Goals = r.t2Goals1 + r.t2Goals2 + r.t2Goals3
    let winner = t1Goals > t2Goals ? r.t1 : r.t2
    let loser = t1Goals > t2Goals ? r.t2 : r.t1
    await sheet.addRow([
      r.seriesId,
      r.id,
      r.t1,
      r.t2,
      t1Goals,
      t2Goals,
      winner,
      loser,
      r.t1Player1,
      r.t1Player2,
      r.t1Player3,
      r.t2Player1,
      r.t2Player2,
      r.t2Player3,
      r.t1Goals1,
      r.t1Goals2,
      r.t1Goals3,
      r.t2Goals1,
      r.t2Goals2,
      r.t2Goals3,
    ])
  }
  console.log('Export complete.')
}

exports.addGames = addGames
exports.authenticate = authenticate
