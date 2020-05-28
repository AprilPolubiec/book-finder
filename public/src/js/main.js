document.addEventListener('DOMContentLoaded', function () {
  const db = firebase.firestore()
  const auth = firebase.auth()
  const functions = firebase.functions()

  if (window.location.hostname == 'localhost') {
    functions.useFunctionsEmulator('http://localhost:5001')
  }

  const main = $('#main')
  const findBookButton = $('#find-book')
  const bookContainer = $('#book-container')

  const likeButtons = $(`<div id='like-buttons'></div>`)
  const dislikeButton = $(
    `<button type="button"><i class="fas fa-times-circle"></i></button>`
  )
  const likeButton = $(
    `<button type="button"><i class="fas fa-check-circle"></i></button>`
  )
  const navTab = $('#nav')
  const library = $('#library')
  likeButtons.append(dislikeButton, likeButton)
  var currentBook = {}

  //Firebase auth UI
  var ui = new firebaseui.auth.AuthUI(auth)
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        console.log(authResult, redirectUrl)
        var { email, name, picture } = authResult.additionalUserInfo.profile
        if (authResult.additionalUserInfo.isNewUser) {
          //Create doc
          db.collection('users').doc(authResult.user.uid).set({
            email,
            name,
            picture,
          })
        }
        $('#login').css('visibility', 'hidden')
        $('#mask').remove()
        displayRandomBook()
        return false
      },
      uiShown: function () {
        document.getElementById('loader').style.display = 'none'
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
  }

  ui.start('#firebaseui-auth-container', uiConfig)

  const renderBook = (bookData) => {
    var bookInfo = bookData.data.volumeInfo
    var bookCard = $(`<div class='book-card center'></div>`)
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
  }

  const renderLoginScreen = () => {
    const pageMask = $(`<div id='mask'></div>`)
    const login = $('#login')
    main.append(pageMask)
    login.css('visibility', 'visible')
  }

  const displayRandomBook = () => {
    const findBook = functions.httpsCallable('findBook')
    findBook().then((result) => {
      currentBook = result
      renderBook(result)
    })
  }

  const updateInterests = () => {
    db.collection('users')
      .doc(auth.currentUser.uid)
      .update({ books: firebase.firestore.FieldValue.arrayUnion(currentBook) })
  }

  likeButton.click(() => {
    $('.book-card').removeClass('center').addClass('swipe').addClass('right')
    if (auth.currentUser) {
      updateInterests()
      displayRandomBook()
    } else {
      renderLoginScreen()
    }
  })

  dislikeButton.click(() => {
    $('.book-card').removeClass('center').addClass('swipe').addClass('left')
    if (auth.currentUser) {
      displayRandomBook()
    } else {
      renderLoginScreen()
    }
  })

  findBookButton.click(() => {
    displayRandomBook()
    $('#main').append(likeButtons)
    findBookButton.remove()
  })

  const toggleNavTabClass = () => {
    if (!library.hasClass('open')) {
      navTab.toggleClass('open')
    }
  }

  navTab.hover(toggleNavTabClass, toggleNavTabClass)

  navTab.click(() => {
    if (!library.hasClass('open')) {
      navTab.removeClass('open')
    } else {
      navTab.addClass('open')
    }
    library.toggleClass('open')
  })
})
