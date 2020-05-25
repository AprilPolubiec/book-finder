const functions = require('firebase-functions')
const fetch = require('node-fetch')
const randomWords = require('random-words')

exports.findBook = functions.https.onCall((data, context) => {
  console.log(`data: ${data}\ncontext: ${context}`)
  const randomWord = randomWords()
  console.log(randomWord)
  return fetch(
    `https://www.googleapis.com/books/v1/volumes?q=insubject:${randomWord}&key=${
      functions.config().books.api.key
    }`
  )
    .then((res) => res.json())
    .then((json) => {
      const { totalItems } = json
      var randomNumber
      if (totalItems < 10) {
        randomNumber = Math.floor(Math.random() * totalItems)
      } else {
        randomNumber = Math.floor(Math.random() * 9)
      }
      return json.items[randomNumber]
    })
})
