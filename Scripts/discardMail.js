// Import neccessary modules and libraries
import { currentUserMailId } from "./userLogin.js";
import { displayDate } from "./userSendMail.js";
import { userMenuValues } from "./userSendMail.js";
import { sendMail, getSendMail } from "./userSendMail.js";
import { inboxMail } from "./userInbox.js";
import { emptyMessage, mailDispContainer } from "./userLogin.js";
import { displayEmptyMessage } from "./userSendMail.js";
import {
  fetchOnloadCount,
  sendCount,
  draftCount,
  trashCount,
} from "./userLogin.js";

// Declare global HTML elements
let discardButton = document.getElementsByClassName("new-message--close")[0];
let toContent = document.getElementsByClassName("compose-mail--Totextbox")[0];
let draftButton = document.getElementsByClassName("menu-container")[2];
let selectedMenuType = document.getElementsByClassName("selected-items")[0];
let subjectContent = document.getElementsByClassName(
  "compose-mail--subjectBox"
)[0];
let bodyContent = document.getElementsByClassName(
  "compose-mail--bodyContent"
)[0];
let userNameDisplay = document.getElementsByClassName("topSection-userName")[0];
let deleteComposeMailWindow =
  document.getElementsByClassName("new-message--trash")[0];

/** Async function to add mail to discard 
 * @param {Object} mailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp, Numberrepersenting read status
 * @returns Array of array containing the dicard mail list of logined user
 */
async function discardMail(mailData) {
  let sendEmail = fetch("/discardMail", {
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

/** Async function to call discardMail function and add contents to discard mail section
 * @param {Object} data containing user mail id, username, 
 * To user name, Subject, Body, Time stamp, Numberrepersenting read status
 * By default display empty message on section3
 */
async function discardMailAdd(data) {
  let discard = await discardMail(data);
  document.getElementsByClassName("section3-contentPage")[0].style.display =
    "none";
  document.getElementsByClassName("email-composePage")[0].style.display =
    "none";
  document.getElementsByClassName("secton3-defaultPage")[0].style.display =
    "block";
  toContent.value = "";
  subjectContent.value = "";
  bodyContent.value = "";
}

// Delete compose mail, It will not add in draft or trash
function deleteComposeMail() {
  document.getElementsByClassName("email-composePage")[0].style.display =
    "none";
  document.getElementsByClassName("secton3-defaultPage")[0].style.display =
    "block";
  toContent.value = "";
  subjectContent.value = "";
  bodyContent.value = "";
}

/** Click event listener for delete icon in compose mail section
 * Calls deleteComposeMail function 
 */
deleteComposeMailWindow.addEventListener("click", function () {
  deleteComposeMail();
});

/** Click event listener for discard button in compse mail section
 * Calls discardMailAddd function and add content to discard mail array
 * Populated section2 with draft mail items
 */
discardButton.addEventListener("click", async function () {
  let discardMailContent = {
    userMailId: currentUserMailId,
    userName: userNameDisplay.innerHTML,
    ToMailId: toContent.value,
    Subject: subjectContent.value,
    BodyDisp: bodyContent.value,
    Date: displayDate(),
  };

  let updateDiscard = await discardMailAdd(discardMailContent);
  selectedMenuType.innerHTML = "Draft items";
  let discardContent = await fetchDiscardMail();
  if (discardContent.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
    draftCount.innerHTML = 0;
  } else {
    let menuDataCount = await fetchOnloadCount(currentUserMailId);
    sendCount.innerHTML = menuDataCount["send"];
    trashCount.innerHTML = menuDataCount["trash"];
    draftCount.innerHTML = menuDataCount["draft"];
    console.log(discardContent);
    userMenuValues(discardContent.reverse());
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
  }
});

/** Async function to fetch discardMail list of logined users
 * @returns Array of array of discard mail contents of logined user
 */
export async function fetchDiscardMail() {
  let sendEmail = fetch("/fetchDraftMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMailId: currentUserMailId }),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  console.log(userSendMailData);
  return userSendMailData;
}

/** Click event listener for discard button in compose page
 * Add contents to discard mail list on click of discard button
 */
draftButton.addEventListener("click", async function () {
  selectedMenuType.innerHTML = "Draft items";

  let discardContent = await fetchDiscardMail();
  if (discardContent.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
    displayEmptyMessage();
    draftCount.innerHTML = 0;
  } else {
    let menuDataCount = await fetchOnloadCount(currentUserMailId);
    sendCount.innerHTML = menuDataCount["send"];
    trashCount.innerHTML = menuDataCount["trash"];
    draftCount.innerHTML = menuDataCount["draft"];
    console.log(discardContent);
    userMenuValues(discardContent);
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
    displayEmptyMessage();
  }
});

/** Async function to delete discard mail
 * @param {Object} data containing user mail id, username, 
 * To user name, Subject, Body, Time stamp, Numberrepersenting read status 
 * @returns Updated array of discard mail list of logined user
 */
async function deleteDiscardMail(data) {
  let sendEmail = fetch("/deleteDiscardMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  return userSendMailData;
}

/** Function to display compose mail section and to sendm mail, add to drafts and delete the draft mails
 * @param {Array} data  Array list containing user mail id, username, 
 * To user name, Subject, Body, Time stamp.
 * Dynamically manipulate DOm structure of compose mail page.
 * Send mail on click of send button from draft list and update new draft list
 * Add to draft on click of discard button
 * Delete mail on click of trash icon.
 * By default display empty message
 * Display selected mail on compose page section
 */
export function displayComposeMail(data) {
  document.getElementsByClassName("secton3-defaultPage")[0].style.display =
    "none";
  document.getElementsByClassName("section3-contentPage")[0].style.display =
    "none";
  document.getElementsByClassName("email-composePage")[0].style.display =
    "block";

  let composePage = document.getElementsByClassName("email-composePage")[0];
  composePage.replaceChildren();
  console.log("dddcdc");
  console.log(data);
  var newMessageSection = document.createElement("div");
  var newMessageText = document.createElement("div");
  var newMessageSendContainer = document.createElement("div");
  var newMessageBackground = document.createElement("div");
  var newMessageSendText = document.createElement("span");
  var sendIcon = document.createElement("img");
  var trashIcon = document.createElement("img");
  var closeIcon = document.createElement("img");
  var composeMailToContainer = document.createElement("div");
  var composeMailToText = document.createElement("div");
  var composeMailToValue = document.createElement("p");
  var composeMailToTextBox = document.createElement("INPUT");
  var composeMailSubjectContainer = document.createElement("div");
  var composeMailSubject = document.createElement("INPUT");
  var composeMailBodyContainer = document.createElement("div");
  var composeMailBody = document.createElement("TEXTAREA");
  composePage.append(
    newMessageSection,
    newMessageText,
    newMessageSendContainer,
    newMessageBackground,
    newMessageSendText,
    sendIcon,
    trashIcon,
    closeIcon,
    composeMailToContainer,
    composeMailToText,
    composeMailToValue,
    composeMailToTextBox,
    composeMailSubjectContainer,
    composeMailSubject,
    composeMailBodyContainer,
    composeMailBody
  );
  newMessageSection.append(
    newMessageText,
    newMessageSendContainer,
    newMessageBackground,
    newMessageSendText,
    sendIcon,
    trashIcon,
    closeIcon
  );
  newMessageSendContainer.append(
    newMessageBackground,
    newMessageSendText,
    sendIcon
  );
  newMessageBackground.append(newMessageSendText, sendIcon);
  composeMailToContainer.append(
    composeMailToText,
    composeMailToValue,
    composeMailToTextBox
  );
  composeMailToText.appendChild(composeMailToValue);
  composeMailSubjectContainer.appendChild(composeMailSubject);
  composeMailBodyContainer.appendChild(composeMailBody);

  newMessageSection.setAttribute("class", "new-message--section");
  newMessageText.setAttribute("class", "new-message--text");
  newMessageSendContainer.setAttribute("class", "new-message--sendContainer");
  newMessageBackground.setAttribute("class", "new-message--background");
  newMessageSendText.setAttribute("class", "new-message-sendText");
  sendIcon.setAttribute("class", "new-message--sendIcon");
  trashIcon.setAttribute("class", "new-message--trash");
  closeIcon.setAttribute("class", "new-message--close");
  composeMailToContainer.setAttribute("class", "compose-mail--Tocontainer");
  composeMailToText.setAttribute("class", "compose-mail--Totext");
  composeMailToTextBox.setAttribute("class", "compose-mail--Totextbox");
  composeMailSubjectContainer.setAttribute(
    "class",
    "compose-mail--subjectContainer"
  );
  composeMailSubject.setAttribute("class", "compose-mail--subjectBox");
  composeMailBodyContainer.setAttribute("class", "compose-mail--bodyContainer");
  composeMailBody.setAttribute("class", "compose-mail--bodyContent");
  sendIcon.src = "../Assests/send.png";
  trashIcon.src = "../Assests/bin.png";
  closeIcon.src = "../Assests/close.png";
  composeMailBody.rows = "10";
  composeMailBody.cols = "80";
  composeMailToValue.innerHTML = "To";
  newMessageText.innerHTML = "New Message";
  newMessageSendText.innerHTML = "Send";
  console.log(data);

  composeMailToTextBox.value = data[2];
  composeMailSubject.value = data[3];
  composeMailBody.innerHTML = data[4];
  let discardMailContent = {
    userMailId: currentUserMailId,
    userName: userNameDisplay.innerHTML,
    ToMailId: data[2],
    Subject: data[3],
    BodyDisp: data[4],
    Date: displayDate(),
  };
  sendIcon.onclick = async function () {
    let userName = userNameDisplay.innerHTML;
    let mailData = {
      userMailId: currentUserMailId,
      userName: userName,
      toMailId: composeMailToTextBox.value,
      Subject: composeMailSubject.value,
      Body: composeMailBody.value,
      Date: displayDate(),
    };
    // await inboxMail(mailData);

    selectedMenuType.innerHTML = "Send items";
    await inboxMail(mailData);
    let sendMailData = await sendMail(mailData);
    let getSentItems = await getSendMail({ mail: currentUserMailId });
    let deleteDraft = await deleteDiscardMail(discardMailContent);
    // window.alert("In draft send");
    // window.alert("In trah draft");
    console.log(deleteDraft);
    userMenuValues(deleteDraft);
    userMenuValues(getSentItems.reverse());
    document.getElementsByClassName("email-composePage")[0].style.display =
      "none";
    document.getElementsByClassName("secton3-defaultPage")[0].style.display =
      "block";
    let menuDataCount = await fetchOnloadCount(currentUserMailId);
    sendCount.innerHTML = menuDataCount["send"];
    trashCount.innerHTML = menuDataCount["trash"];
    draftCount.innerHTML = menuDataCount["draft"];
    composeMailToTextBox.value = "";
    composeMailSubject.value = "";
    composeMailBody.value = "";
  };
  trashIcon.onclick = async function () {
    document.getElementsByClassName("section3-contentPage")[0].style.display =
      "none";
    document.getElementsByClassName("email-composePage")[0].style.display =
      "none";
    document.getElementsByClassName("secton3-defaultPage")[0].style.display =
      "block";
    let deleteDraft = await deleteDiscardMail(discardMailContent);
    if (deleteDraft.length == 0) {
      emptyMessage.style.display = "block";
      mailDispContainer.style.display = "none";
      draftCount.innerHTML = 0;
    } else {
      // window.alert("In trah draft");
      console.log(deleteDraft);
      userMenuValues(deleteDraft);
      emptyMessage.style.display = "none";
      mailDispContainer.style.display = "block";
      let menuDataCount = await fetchOnloadCount(currentUserMailId);
      sendCount.innerHTML = menuDataCount["send"];
      trashCount.innerHTML = menuDataCount["trash"];
      draftCount.innerHTML = menuDataCount["draft"];
    }

    composeMailToTextBox.value = "";
    composeMailSubject.value = "";
    composeMailBody.value = "";
  };
  let composeButton = document.getElementsByClassName("compose-button")[0];
  composeButton.addEventListener("click", function () {
    composeMailToTextBox.value = "";
    composeMailSubject.value = "";
    composeMailBody.value = "";
    closeIcon.onclick = async function () {
      // window.alert("In draft");
      let composeDiscardContent = {
        userMailId: currentUserMailId,
        ToMailId: composeMailToTextBox.value,
        Subject: composeMailSubject.value,
        BodyDisp: composeMailSubject.value,
        Date: displayDate(),
      };
      let updateDiscard = await discardMailAdd(composeDiscardContent);
      selectedMenuType.innerHTML = "Draft items";
      let discardContent = await fetchDiscardMail();
      if (discardContent.length == 0) {
        emptyMessage.style.display = "block";
        mailDispContainer.style.display = "none";
        draftCount.innerHTML = 0;
      } else {
        console.log(discardContent);
        userMenuValues(discardContent);
        emptyMessage.style.display = "none";
        mailDispContainer.style.display = "block";
        let menuDataCount = await fetchOnloadCount(currentUserMailId);
        sendCount.innerHTML = menuDataCount["send"];
        trashCount.innerHTML = menuDataCount["trash"];
        draftCount.innerHTML = menuDataCount["draft"];
      }

      document.getElementsByClassName("section3-contentPage")[0].style.display =
        "none";
      document.getElementsByClassName("email-composePage")[0].style.display =
        "none";
      document.getElementsByClassName("secton3-defaultPage")[0].style.display =
        "block";

      composeMailToTextBox.value = "";
      composeMailSubject.value = "";
      composeMailBody.value = "";
    };
  });
  closeIcon.onclick = async function (discardMailContent) {
    // window.alert("In close");
    composeMailToTextBox.value = "";
    composeMailSubject.value = "";
    composeMailBody.value = "";
    document.getElementsByClassName("section3-contentPage")[0].style.display =
      "none";
    document.getElementsByClassName("email-composePage")[0].style.display =
      "none";
    document.getElementsByClassName("secton3-defaultPage")[0].style.display =
      "block";
  };
}
