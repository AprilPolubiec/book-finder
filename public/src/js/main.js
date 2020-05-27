document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.firestore()
  const auth = firebase.auth()
  const functions = firebase.functions()
  if (window.location.hostname == 'localhost') {
    functions.useFunctionsEmulator('http://localhost:5001')
  }

  const displayRandomBook = (swipe_direction) => {
    const findBook = functions.httpsCallable('findBook')
    findBook().then((result) => {
      var bookInfo = result.data.volumeInfo
      var bookCard = $(`<div class='book-card center'></div>`)
      // $('#book-container .book-card:nth-last-child(2)').removeClass('left')
      // bookContainer.children().last().removeClass('center').addClass('left')
      bookContainer.children().last().remove()
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
  }

  const findBookButton = $('#find-book')
  const bookContainer = $('#book-container')

  const likeButtons = $(`<div id='like-buttons'></div>`)
  const dislikeButton = $(
    `<button type="button"><i class="fas fa-times-circle"></i></button>`
  )
  const likeButton = $(
    `<button type="button"><i class="fas fa-check-circle"></i></button>`
  )
  likeButtons.append(dislikeButton, likeButton)

  likeButton.click(() => {
    $('.book-card').removeClass('center').addClass('swipe').addClass('right')
    displayRandomBook()
  })

  dislikeButton.click(() => {
    $('.book-card').removeClass('center').addClass('swipe').addClass('left')
    displayRandomBook()
  })

  findBookButton.click(() => {
    displayRandomBook()
    $('#main').append(likeButtons)
    findBookButton.remove()
  })
})
