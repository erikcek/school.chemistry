function togglemenu() {
  console.log('here');

  const elem = document.getElementById('menu');
  console.log(elem.style.display);

  if (elem.style.display === 'none' || elem.style.display === '') {
    elem.style.display = 'flex';
  } else {
    elem.style.display = '';
  }
}
