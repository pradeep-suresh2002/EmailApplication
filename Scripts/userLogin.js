// Import neccessary modules and libraries
import { firstName } from "./userSignup.js";
import { defaultOnloadUpdate } from "./userSendMail.js";
import { fetchInboxMail, inboxMail } from "./userInbox.js";
import { userMenuValues, displaySelectedMail } from "./userSendMail.js";
import {
  fetchUnreadInboxMail,
  changeReadMessage,
  inboxCount,
  mailContent,
} from "./userInbox.js";

// Export common global HTML elements.
export let sendCount = document.getElementsByClassName("menu-count")[1];
export let draftCount = document.getElementsByClassName("menu-count")[2];
export let trashCount = document.getElementsByClassName("menu-count")[3];
export let emptyMessage = document.getElementsByClassName("empty-section")[0];
export let mailDispContainer = document.getElementsByClassName(
  "mail-display--container"
)[0];
export let currentUserMailId;

// Declare global HTML elements
let emailId = document.getElementsByClassName("email")[0];
let password = document.getElementsByClassName("password")[0];
let loginButton = document.getElementsByClassName("login-button")[0];
let signUpButton = document.getElementsByClassName("signup-link")[0];
let signupPage = document.getElementById("signup-page--section");
let loginPage = document.getElementById("login-page--section");
let emailDefaultPage = document.getElementsByClassName("email-defaultPage")[0];
let topSectionUserName = document.getElementsByClassName(
  "topSection-userName"
)[0];
let selectedMenuType = document.getElementsByClassName("selected-items")[0];

/** Async function API call to server to validate user data
 * @param {Object} userLoginCredentials contains Object of userEmailId and Password
 * @returns Object of user validity status message
 */
async function fetchLoginStatus(userLoginCredentials) {
  let getStatus = fetch("/userLoginData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userLoginCredentials),
  });
  let data = await getStatus;
  let output = await data.json();
  console.log(output);
  return output;
}

/** Click event listener for click button
 * Send user's emailId and Password to fetch status
 * For valid users display send mails, draft mails and trash mails and their count on page load
 * Display inbox mails and count of unread inbox mail
 * Altert message pop up for invalid users
 */
loginButton.addEventListener("click", async function () {
  let userLoginCredentials = {
    mailId: emailId.value,
    password: password.value,
  };
  let loginStatus = await fetchLoginStatus(userLoginCredentials);
  console.log(loginStatus.response);
  if (loginStatus.response == "valid") {
    loginPage.style.display = "none";
    emailDefaultPage.style.display = "block";
    let userName = loginStatus.firstName + " " + loginStatus.lastName;
    topSectionUserName.innerHTML = userName;
    currentUserMailId = emailId.value;
    let defaultPage = fetch("/fetchOnload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMailId: emailId.value }),
    });
    let menuDataCount = await fetchOnloadCount(emailId.value);
    sendCount.innerHTML = menuDataCount["send"];
    draftCount.innerHTML = menuDataCount["draft"];
    trashCount.innerHTML = menuDataCount["trash"];
    let dataDefault = await defaultPage;
    let output = await dataDefault.json();
    let InboxMail = await fetchInboxMail(emailId.value);
    // window.alert(InboxMail.length);
    if (InboxMail.length == 0) {
      // window.alert("Empty ");
      emptyMessage.style.display = "block";
      userMenuValues(InboxMail);
      selectedMenuType.innerHTML = "Inbox items";
      inboxCount.innerHTML = 0;
    } else if (InboxMail.length > 0) {
      // window.alert("Contains");

      emptyMessage.style.display = "none";
      mailDispContainer.style.display = "block";

      for (let i = 0; i < InboxMail.length; i++) {
        let userMail = InboxMail[i][0];
        InboxMail[i][0] = InboxMail[i][2];
        InboxMail[i][2] = userMail;
      }
      userMenuValues(InboxMail);
      selectedMenuType.innerHTML = "Inbox items";
      let unreadCount = await fetchUnreadInboxMail();
      unreadCount = unreadCount.unreadMailCount;
      inboxCount.innerHTML = unreadCount;

      console.log(unreadCount.unreadMailCount);
      for (let i = 0; i < InboxMail.length; i++) {
        if (InboxMail[i][6] == "1") {
          // window.alert("In unread")

          mailContent[i].style.fontWeight = "900";
          mailContent[i].onclick = async function () {
            // window.alert("Hey");
            displaySelectedMail(InboxMail[i]);
            // mailContent[i].style.backgroundColor = "red";
            let data = await changeReadMessage(InboxMail[i]);
            let unreadCount = await fetchUnreadInboxMail();
            unreadCount = unreadCount.unreadMailCount;
            inboxCount.innerHTML = unreadCount;
            console.log(data);
            if (data["readType"] == "read") {
              mailContent[i].style.fontWeight = "100";
            }
          };
        }
      }
    }
  } else if (loginStatus.response == "invalid") {
    window.alert("Enter a valid mail id and password");
    emailId.value = "";
    password.value = "";
  }
});
/** Click event listener for sign up button
 * Display signup page and hide login page
 */
signUpButton.addEventListener("click", function () {
  signupPage.style.display = "block";
  loginPage.style.display = "none";
  emailId.value = "";
  password.value = "";
});

/** Fetch count of send, draft and trash mails of respective users
 * @param {string} mail User entered mail id
 * @returns Object with keys value pairs of send item and it's count, draft item and it's count
 * trash item and it's count
 */
export async function fetchOnloadCount(mail) {
  let fetchCount = fetch("/fetchCount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMailId: mail }),
  });
  let count = await fetchCount;
  let outputCount = await count.json();
  // console.log(outputCount);
  return outputCount;
}
