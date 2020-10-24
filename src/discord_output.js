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

exports.delayed = delayed
