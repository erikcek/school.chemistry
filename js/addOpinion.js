// /*
//  * Created by Stefan Korecko, 2020
//  * Form processing functionality
//  */

// function processOpnFrmData(event) {
//   //1.prevent normal event (form sending) processing
//   event.preventDefault();

//   //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
//   const nopName = document.getElementById('nameElm').value.trim();
//   const nopOpn = document.getElementById('opnElm').value.trim();
//   const nopWillReturn = document.getElementById('willReturnElm').checked;

//   //3. Verify the data
//   if (nopName == '' || nopOpn == '') {
//     window.alert('Please, enter both your name and opinion');
//     return;
//   }

//   //3. Add the data to the array opinions and local storage
//   const newOpinion = {
//     name: nopName,
//     comment: nopOpn,
//     willReturn: nopWillReturn,
//     created: new Date(),
//   };

//   let opinions = [];

//   if (localStorage.myTreesComments) {
//     opinions = JSON.parse(localStorage.myTreesComments);
//   }

//   opinions.push(newOpinion);
//   localStorage.myTreesComments = JSON.stringify(opinions);

//   //5. Go to the opinions
//   window.location.hash = '#opinions';
// }

// const renderOpinion = (elem) => {
//   //   const template = document.getElementById('opinionTemplate').innerHTML;
//   const formatedElement = Object.assign({}, elem, {
//     createdDate: new Date(elem.createdDate).toLocaleDateString(),
//   });

//   const renderedOpinion = Mustache.render(template, formatedElement);
//   return renderedOpinion;
// };

const saveData = (e) => {
  console.log('here');

  e.preventDefault();
  var elements = document.getElementById('contactForm').elements;
  var opinions = [];
  if (localStorage.contactForm) {
    opinions = JSON.parse(localStorage.contactForm);
  }

  console.log(opinions);

  var opinion = {
    name: elements['name'].value,
    email: elements['email'].value,
    pictureUrl: elements['pictureUrl'].value,
    gender: elements['gender'].value,
    text: elements['userOpinion'].value,
    keyvord: elements['keywordsSelect'].value,
    acceptance: elements['personalInfo'].value == 'on' ? true : false,
    createdDate: new Date(),
  };

  console.log(opinion);

  opinions.push(opinion);
  localStorage.contactForm = JSON.stringify(opinions);
  document.getElementById('contactForm').reset();
  //   renderOpinions();
  window.location.hash = '#opinions';
};
