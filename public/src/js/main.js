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
  const bookPreviewContainer = $('#book-preview')
  const closePreviewButton = $('#close-button')
  likeButtons.append(dislikeButton, likeButton)
  var currentBook = {}

  //Firebase auth UI
  var ui = new firebaseui.auth.AuthUI(auth)
  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // console.log(authResult, redirectUrl)
        var { email, name, picture } = authResult.additionalUserInfo.profile
        if (authResult.additionalUserInfo.isNewUser) {
          //Create doc
          console.log('adding doc')
          db.collection('users')
            .doc(authResult.user.uid)
            .set({
              email,
              name,
              picture,
              books: [currentBook],
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

  const renderBook = (bookData, src) => {
    console.log('rendering book from ', src)
    var container
    switch (src) {
      case 'main':
        container = bookContainer
        break
      case 'library':
        container = bookPreviewContainer
        $('#close-button').css('visibility', 'visible')
        break
      default:
        break
    }
    var bookInfo = bookData.data.volumeInfo
    var bookCard = $(`<div class='book-card center'></div>`)
    container.children().last().remove()
    container.append(bookCard)
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
    container.css('visibility', 'visible')
  }

  closePreviewButton.click(() => {
    bookPreviewContainer.css('visibility', 'hidden')
    closePreviewButton.css('visibility', 'hidden')
  })

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
      renderBook(result, 'main')
    })
  }

  const updateInterests = () => {
    db.collection('users')
      .doc(auth.currentUser.uid)
      .update({ books: firebase.firestore.FieldValue.arrayUnion(currentBook) })
  }

  const updateLibrary = (books) => {
    var books = books
    books.forEach((book) => {
      console.log(book)
      var id = book.data.id
      if ($(`#${book.data.id}`).length === 0) {
        var libraryBookEl = $(`<div id=${id} class="book"></div>`)
        var bookImage = $(
          `<img src='${book.data.volumeInfo.imageLinks.thumbnail}'></img>`
        )
        bookImage.click(() => {
          renderBook(book, 'library')
        })
        libraryBookEl.append(bookImage)
        library.append(libraryBookEl)
      }
    })
  }

  var unsubscribeDoc = () => {}
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log(user.uid)
      unsubscribeDoc = db
        .collection('users')
        .doc(user.uid)
        .onSnapshot(
          (doc) => {
            updateLibrary(doc.data().books)
          },
          (error) => {
            console.log('User does not exist')
            auth.signOut()
          }
        )
    } else {
      unsubscribeDoc()
      console.log('no user')
    }
  })

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
