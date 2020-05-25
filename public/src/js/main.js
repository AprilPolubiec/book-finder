document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.firestore()
  const auth = firebase.auth()
  const functions = firebase.functions()
  if (window.location.hostname == 'localhost') {
    functions.useFunctionsEmulator('http://localhost:5001')
  }
  const findBook = functions.httpsCallable('findBook')

  const findBookButton = $('#find-book')
  const bookContainer = $('#book-container')
  findBookButton.click(() => {
    findBook().then((result) => {
      console.log(result)
      var bookInfo = result.data.volumeInfo
      var bookCard = $(`<div class='book-card center'></div>`)
      // $('#book-container .book-card:nth-last-child(2)').removeClass('left')
      // bookContainer.children().last().removeClass('center').addClass('left')
      bookContainer.append(bookCard)
      bookCard.append(`<img src='${bookInfo.imageLinks.thumbnail}'></img>`)
      bookCard.append(
        `<div>Title: ${bookInfo.title}${
          bookInfo.subtitle ? `: ${bookInfo.subtitle}` : ''
        }</div>`
      )
      bookCard.append(`<div>Author: ${bookInfo.authors[0]}</div>`)
      bookCard.append(`<div>Description: ${bookInfo.description}</div>`)
      bookCard.append(
        `<a href="${bookInfo.previewLink}" target="_blank">Preview</a>`
      )

      //Add click event listener to book card
      // bookCard.click((e) => {
      //   console.log(e)
      //   bookCard.next().removeClass('center').addClass('right')
      //   bookCard.removeClass('left').addClass('center')
      //   bookCard.previous().addClass('left')
      // })
    })
  })
})
