const admin = require('firebase-admin')
const functions = require('firebase-functions')
const axios = require('axios')
const randomWords = require('random-words')

admin.initializeApp()

exports.findBook = functions.https.onCall((data, context) => {
  const randomWord = randomWords()
  console.log(randomWord)
  return axios
    .get(
      `https://www.googleapis.com/books/v1/volumes?country=US&q=insubject:${randomWord}&key=${
        functions.config().books.api.key
      }`
    )
    .then((response) => {
      var data = response.data
      const { totalItems } = data
      var randomNumber
      if (totalItems < 10) {
        randomNumber = Math.floor(Math.random() * totalItems)
      } else {
        randomNumber = Math.floor(Math.random() * 9)
      }
      return data.items[randomNumber]
    })
    .catch((error) => console.log(error))
})
