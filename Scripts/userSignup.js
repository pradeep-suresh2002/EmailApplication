// Export neccessary modules and variables
export let firstName = document.getElementsByClassName("user-firstName")[0];
// Declare global HTML elements
let lastName = document.getElementsByClassName("user-lastName")[0];
let userEmail = document.getElementsByClassName("email")[1];
let userPassword = document.getElementsByClassName("password")[1];
let signUpButton = document.getElementsByClassName("login-button")[1];
let signupPage = document.getElementById("signup-page--section");
let loginPage = document.getElementById("login-page--section");
let backToLoginButton = document.getElementsByClassName("back-to-login")[0];

/** Click event listener for singUp button
 * Fetch user's firstname, lastname, mailId and password.
 * Send data to server and store in userDetails.json
 * After signup open Login page.
 */
signUpButton.addEventListener("click", function () {
  let userFirstName = firstName.value;
  let userLastName = lastName.value;
  let userMailValue = userEmail.value;
  let userPasswordValue = userPassword.value;
  let userJsonData = {
    firstName: userFirstName,
    lastName: userLastName,
    userMailId: userMailValue,
    userPassword: userPasswordValue,
  };
  fetch("/signUpdata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userJsonData),
  })
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.log(error);
    });

  firstName.value = "";
  lastName.value = "";
  userEmail.value = "";
  userPassword.value = "";
  signupPage.style.display = "none";
  loginPage.style.display = "block";
});

/** Click event listener for backToLogin button
 * Open Login page on click of back to login button */
backToLoginButton.addEventListener("click", function () {
  signupPage.style.display = "none";
  loginPage.style.display = "block";
  firstName.value = "";
  lastName.value = "";
  userEmail.value = "";
  userPassword.value = "";
});
