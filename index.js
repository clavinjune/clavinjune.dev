'use strict'

const $ = el => document.querySelector(el)

document.oncontextmenu = e => false
document.onkeydown = e => false

window.onresize = e => {
  $('.landing.home').scrollIntoView({behavior: 'smooth'})
}

$('.burger').onclick = e => { $('.burger').classList.toggle('open') }

$('#home').onclick = e => {
  $('.landing.home').scrollIntoView({behavior: 'smooth'})
}

$('#about').onclick = e => {
  $('.landing.about').scrollIntoView({behavior: 'smooth'})
}

$('#knowledge').onclick = e => {
  $('.landing.knowledge').scrollIntoView({behavior: 'smooth'})
}

$('#timeline').onclick = e => {
  $('.landing.timeline').scrollIntoView({behavior: 'smooth'})
}
