
// to shuffle images' numbers when the page is refreshed or game is restarted
var cards;
var openedCards = [];
var matchedCards = 0;

var counter;
var counting = false;

var seconds = 0, minutes = 0, hours = 0;

var firsCardOpened = false;
var currentTimer = null;
var start = null;

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function repeatArray(arr, count) {
  var ln = arr.length;
  var b = new Array();
  for(i=0; i<count; i++) {
    b.push(arr[i%ln]);
  }
  return b;
}

function setBacksideImage() {
  var images = document.querySelectorAll(".front img");
  for (var i = 0, len = images.length; i < len; i++) {
    var elem = images[i];
    elem.src = './images/back.jpg';
  }
}

function closeAllCards() {
  for (var i = 0, len = cards.length; i < len; i++) {
    var elem = cards[i];
    elem.classList.remove('flip');
  }
}

function setImages() {
  // [1,2,3,4,5,6,7,8]
  var arr = ['01', '02', '03', '04', '05', '06', '07', '08'];
  var arr2 = arr.map(x => x+'_equals');
  var imageNames = arr.concat(arr2);
  shuffle(imageNames);
  var images = document.querySelectorAll(".back img");
  for (var i = 0, len = images.length; i < len; i++) {
    var elem = images[i];
    elem.src = './images/tiles/png/' + imageNames[i].toString() + '.png';
  }
}

function disableCards() {
  for (var i = 0, len = cards.length; i < len; i++) {
    var elem = cards[i];
    elem.classList.add('disabled');
  }
}

function enableCards() {
  for (var i = 0, len = cards.length; i < len; i++) {
    var elem = cards[i];
    elem.classList.remove('disabled');
  }
}

function hideAnswers() {
  var answers = document.querySelectorAll('.formula');
  for (var i = 0, len = answers.length; i < len; i++) {
    var elem = answers[i];
    elem.parentElement.classList.remove('highlighted-formula');
    elem.style.visibility = 'hidden';
  }
}

function shuffleCards() {
  // close win-popup when play-again button is pressed
  var popup = document.getElementById('win-popup');
  popup.style.display = "none";
  openedCards = [];
  matchedCards = 0;
  disableCards();
  hideAnswers();
  for (var i = 0, len = cards.length; i < len; i++) {
    var elem = cards[i];
    elem.classList.remove('matched');
    elem.classList.remove('unmatched');
  }
  closeAllCards();
  setTimeout(setImages, 500);
  setTimeout(enableCards, 500);
  counting = true;
  delta = 0;
  start = new Date().getTime();
  stopTimer(currentTimer);
  currentTimer = null;
  firstCardOpened = false;
  document.getElementById('timer').innerHTML = "00:00:00";
}

var formulas = {
  1: '$$P = \\frac{F}{S}$$',
  2: '$$m = \\rho \\cdot  V$$',
  3: '$$v = \\frac{S}{t}$$',
  4: '$$S = v \\cdot t$$',
  5: '$$N = \\frac{A}{t}$$',
  6: '$$A = F \\cdot S$$',
  7: '$$V = \\frac{m}{\\rho}$$',
  8: '$$\\rho = \\frac{m}{V}$$'
}

function displayFormula(id) {
  var answer = document.getElementById(id);
  answer.innerHTML += formulas[id];
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, answer]);
  answer.style.visibility = 'visible';
  highlightFormula(answer.parentElement);
}

function highlightFormula(elem) {
  elem.classList.add('highlighted-formula');
}


function matched(imgId) {
  imgId = parseInt(imgId);
  displayFormula(imgId);
  openedCards[0].classList.add('disabled');
  openedCards[1].classList.add('disabled');
  openedCards[0].classList.add('matched');
  openedCards[1].classList.add('matched');
  openedCards = [];
  matchedCards += 2;
}

function unmatched() {
  openedCards[0].classList.add('disabled');
  openedCards[1].classList.add('disabled');
  openedCards[0].classList.add('unmatched');
  openedCards[1].classList.add('unmatched');
}


function flip(elem) {
  if (!firstCardOpened) { currentTimer = timer() }
  firstCardOpened = true;
  elem.classList.add('disabled');
  openedCards.push(elem);
  if (openedCards.length == 2) {
    var img1 = openedCards[0].querySelector('.back img').src;
    var img2 = openedCards[1].querySelector('.back img').src;
    img1 = img1.split('/').splice(-1).pop().substring(0,2);
    img2 = img2.split('/').splice(-1).pop().substring(0,2);
    if (img1 === img2) {
      matched(img1);
    } else {
      unmatched();
    }
  }
  if (openedCards.length == 3) {
    // close previous two cards
    openedCards[0].classList.remove('disabled');
    openedCards[1].classList.remove('disabled');
    openedCards[0].classList.remove('unmatched');
    openedCards[1].classList.remove('unmatched');
    openedCards[0].classList.toggle('flip');
    openedCards[1].classList.toggle('flip');
    // reset openedCards
    openedCards.splice(0, 2);
  }
  elem.classList.toggle("flip");
  congratulations();
}

function congratulations() {
  if (matchedCards == cards.length) {
    setTimeout(function() {
      var popup = document.getElementById('win-popup');
      var span = document.getElementsByClassName("close")[0];
      var popupContent = document.getElementById('your-time');
      popupContent.textContent = "Your time is " + hours + ":" + minutes + ":" + seconds;
      popup.style.display = "block";
      span.onclick = function() {
          popup.style.display = "none";
      }
      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == popup) {
              popup.style.display = "none";
          }
      }
    }, 2000);
    counting = false;
  }
}

function timer() {
  start = new Date().getTime();
  return setInterval(function() {
    var now = new Date().getTime();
    delta = now - start;
    seconds = Math.floor((delta % (1000 * 60)) / 1000);
    hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    if (hours < 10) hours = "0" + hours;
    if (counting) {
      document.getElementById("timer").innerHTML = hours + ":" + minutes + ":" + seconds;
    }
  }, 500);
}

function stopTimer(t) {
  clearInterval(t);
}


$(document).ready(function() {
  console.log('ready!');
  var delta = 0;
  cards = document.querySelectorAll(".card");
  counter = document.getElementById('timer');
  shuffleCards();
  setBacksideImage();
  $('.card').click(function() {
    flip(this);
  })
  $('#shuffle').click(function() {
    shuffleCards();
  })
})
