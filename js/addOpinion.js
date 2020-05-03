const back4appURL = 'https://parseapi.back4app.com/classes/opinions';

const saveData = async (e) => {
  console.log('here');

  e.preventDefault();
  const elements = document.getElementById('contactForm').elements;
  let opinions = [];
  if (localStorage.contactForm) {
    opinions = JSON.parse(localStorage.contactForm);
  }

  console.log(opinions);

  const opinion = {
    name: elements['name'].value,
    email: elements['email'].value,
    pictureUrl: elements['pictureUrl'].value,
    gender: elements['gender'].value,
    text: elements['userOpinion'].value,
    keyvord: elements['keywordsSelect'].value,
    acceptance: elements['personalInfo'].value == 'on' ? true : false,
    createdDate: new Date(),
  };

  if (opinion.name == '' || opinion.text == '') {
    window.alert('Please fill name and email');
    return;
  }

  try {
    const response = await saveOpinoin(opinion);
    if (!response.ok) {
      throw new Error('There was a problem with saving your opinion: :(');
    }
    document.getElementById('contactForm').reset();
    window.location.hash = '#opinions';
  } catch (error) {
    window.alert(error);
  }
};

const saveOpinoin = async (data) => {
  const options = {
    method: 'POST',
    headers: {
      'X-Parse-Application-Id': 'lz2QCBACZ3E4XKq8rNJ9wC8ddHdMEDtIl750sO0u',
      'X-Parse-REST-API-Key': 'Q3NgdE00PieVrb4EjWbcjmt983Imynswu2zDRUOQ',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(back4appURL, options);
  return response;
};
