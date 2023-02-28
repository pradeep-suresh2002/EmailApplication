// Import neccessary modules and libraries
import { userMenuValues } from "./userSendMail.js";
import { currentUserMailId } from "./userLogin.js";
import { emptyMessage, mailDispContainer } from "./userLogin.js";
import { displayEmptyMessage } from "./userSendMail.js";
import {
  fetchOnloadCount,
  sendCount,
  draftCount,
  trashCount,
} from "./userLogin.js";

// Declare global HTML elements
let trashButton = document.getElementsByClassName("section3-trashicon")[0];
let trashMenu = document.getElementsByClassName("menu-container")[3];
let selectedMenuType = document.getElementsByClassName("selected-items")[0];
let gridContainer = document.getElementById("email-bodySection");
let section1Container = document.getElementsByClassName(
  "section1-menutab--container"
)[0];
let section1ButtonContainer = document.getElementsByClassName(
  "section1-buttonContainer"
)[0];
let emailComposepage = document.getElementsByClassName("email-composePage")[0];
let section1 = document.getElementsByClassName("section1")[0];
let section2Container = document.getElementsByClassName("section2")[0];
let section3Container = document.getElementsByClassName("section3")[0];
let hamburgerButton = document.getElementsByClassName("menu-button")[0];

/** Click event listener for Hamburger button
 * Hide section1 menu list on pressing hamburger button display only section2 and section3
 * On click again change format to orginal format
 */
hamburgerButton.addEventListener("click", function () {
  section1Container.classList.toggle("hide");
  gridContainer.classList.toggle("changeGridOrder");
  section2Container.classList.toggle("section2Change");
  section3Container.classList.toggle("section3Change");
  emailComposepage.classList.toggle("composePage");
});

/** async function to get contents of mail to be deleted
 * @param {Object} deleteMailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp.
 */
export async function getDeleteMailData(deleteMailData) {
  deleteMail(deleteMailData);
}

/** Async function to delete mail 
 * @param {Object} mailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp. 
 * @returns Array of array containing list of new list after deleting specified mail
 */
async function deleteMail(mailData) {
  let sendEmail = fetch("/deleteMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailData),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  return userSendMailData;
}

/** Async function to trash mail list
 * @returns Array of array of trash mail items of logined user
 */
export async function fetchDeleteMail() {
  let sendEmail = fetch("/trashMenu", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mail: currentUserMailId }),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  return userSendMailData.reverse();
}

/** Click event listener for trashIcon to delete mail from trash list
 * By default display empty message and update count of trash mail list on click of trash icon
 */
trashMenu.addEventListener("click", async function () {
  let deleteData = await fetchDeleteMail();

  displayEmptyMessage();
  selectedMenuType.innerHTML = "Trash items";
  if (deleteData.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
    trashCount.innerHTML = 0;
  } else {
    userMenuValues(deleteData);
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
    let menuDataCount = await fetchOnloadCount(currentUserMailId);
    sendCount.innerHTML = menuDataCount["send"];
    trashCount.innerHTML = menuDataCount["trash"];
    draftCount.innerHTML = menuDataCount["draft"];
  }
});

