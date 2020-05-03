let auth2 = {};

function startGSingIn() {
  gapi.load('auth2', function () {
    gapi.signin2.render('SignInButton', {
      width: 240,
      height: 50,
      longtitle: true,
      theme: 'white',
      onsuccess: onSuccess,
      onfailure: onFailure,
    });
    gapi.auth2.init().then(
      //zavolat po inicializácii OAuth 2.0  (called after OAuth 2.0 initialisation)
      function () {
        auth2 = gapi.auth2.getAuthInstance();
        auth2.currentUser.listen(userChanged);
        auth2.isSignedIn.listen(updateSignIn);
        auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
      }
    );
  });
}

const onSuccess = (googleUser) => {
  console.log(googleUser.getBasicProfile());

  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
};

const onFailure = (error) => {
  console.log(error);
};

const updateSignIn = () => {
  rednerSignButtons();
  console.log('update signin');
  reloadHash();
};

const userChanged = () => {
  console.log('userchanged');
};

const rednerSignButtons = () => {
  const sgnd = auth2.isSignedIn.get();

  if (sgnd) {
    document.getElementById(
      'SignedUser'
    ).innerHTML = `from ${auth2.currentUser.get().getBasicProfile().getName()}`;
    document.getElementById('SignInButton').classList.add('hide');
    document.getElementById('SignedUser').classList.remove('hide');
    document.getElementById('SignOutButton').classList.remove('hide');
  } else {
    document.getElementById('SignOutButton').classList.add('hide');
    document.getElementById('SignedUser').classList.add('hide');
    document.getElementById('SignInButton').classList.remove('hide');
  }
};

const userUpdate = () => {};

const saveUserInfo = (name, email) => {};

const signOut = () => {
  const auth2 = gapi.auth2.getAuthInstance();

  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
};

const reloadHash = () => {
  //this ensures that data in addOpinionFormwillBe refreshed
  // unfortionately it will delete all data
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};
