// Import neccessary modules and libraries
import { currentUserMailId } from "./userLogin.js";
import { getDeleteMailData, fetchDeleteMail } from "./userDeleteMail.js";
import { displayComposeMail } from "./discardMail.js";
import { fetchInboxMail, inboxMail, mailContent } from "./userInbox.js";
import {
  emptyMessage,
  mailDispContainer,
  sendCount,
  draftCount,
  trashCount,
  fetchOnloadCount,
} from "./userLogin.js";
import {
  fetchUnreadInboxMail,
  inboxCount,
  changeReadMessage,
} from "./userInbox.js";

// Declare global HTML elements
let composeMailButton = document.getElementsByClassName("compose-button")[0];
let composeMailWindow = document.getElementsByClassName("email-composePage")[0];
let defaultSectionPage = document.getElementsByClassName(
  "secton3-defaultPage"
)[0];
let sendButton = document.getElementsByClassName(
  "new-message--sendContainer"
)[0];
let toMailId = document.getElementsByClassName("compose-mail--Totextbox")[0];
let composeMailSubject = document.getElementsByClassName(
  "compose-mail--subjectBox"
)[0];
let composeMailBodyContent = document.getElementsByClassName(
  "compose-mail--bodyContent"
)[0];
let inboxButton = document.getElementsByClassName("menu-container")[0];
let sendItemsMenuButton = document.getElementsByClassName("menu-container")[1];
let selectedMenuType = document.getElementsByClassName("selected-items")[0];
let userNameDisplay = document.getElementsByClassName("topSection-userName")[0];
let composePage = document.getElementsByClassName("email-composePage")[0];

/** Click event listener for compose mail button
 * Display compose mail page on section3
 */
composeMailButton.addEventListener("click", function () {
  defaultSectionPage.style.display = "none";
  composeMailWindow.style.display = "block";
  document.getElementsByClassName("section3-contentPage")[0].style.display =
    "none";
  document.getElementsByClassName("compose-mail--bodyContent")[0].innerHTML =
    "";
});

/** Async function to send mail to other users
 * To send mails to other users
 * @param {Object} mailContent containing user mail id, username, 
 * To user name, Subject, Body, Time stamp. 
 * @returns updated JSON data of current user
 */
export async function sendMail(mailContent) {
  let sendEmail = fetch("/sendMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailContent),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  return userSendMailData;
}

/** Async function to get the send mails.
 * Updates the lsit of send mails
 * @param {Object} mail containing user mail id, username, 
 * To user name, Subject, Body, Time stamp. 
 * @returns Array of send items mail list
 */
export async function getSendMail(mail) {
  let sendEmail = fetch("/getSentItems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mail),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  return userSendMailData;
}

/** Click event listener for send button in compose mail section
 * Replace the new lines entered by the user with br tag to provide line
 * After sending mail display empty message as no mail is selected at that moment.
 * Change to the send items menu
 * Fetch the update the count of send, draft and trash mails
 */
sendButton.addEventListener("click", async function () {
  let toMailIdValue = toMailId.value;
  let composeMailSubjectValue = composeMailSubject.value;
  let composeMailBodyContentValue = composeMailBodyContent.value.replace(
    /\r\n|\r|\n/g,
    "<br>"
  );
  let userName = userNameDisplay.innerHTML;
  console.log(userName);
  let mailData = {
    userMailId: currentUserMailId,
    userName: userName,
    toMailId: toMailIdValue,
    Subject: composeMailSubjectValue,
    Body: composeMailBodyContentValue,
    Date: displayDate(),
  };
  inboxMail(mailData);
  console.log(composeMailBodyContentValue);
  selectedMenuType.innerHTML = "Send items";

  // draftCount.innerHTML = menuDataCount["draft"];
  // trashCount.innerHTML = menuDataCount["trash"];
  let sendMailData = await sendMail(mailData);
  let getSentItems = await getSendMail({ mail: currentUserMailId });
  if (getSentItems.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
    sendCount.innerHTML = 0;
  } else {
    let menuDataCount = await fetchOnloadCount(currentUserMailId);
    sendCount.innerHTML = menuDataCount["send"];
    userMenuValues(getSentItems.reverse());
    defaultSectionPage.style.display = "block";
    composeMailWindow.style.display = "none";
    toMailId.value = "";
    composeMailSubject.value = "";
    composeMailBodyContent.value = "";
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
  }
});


/** Async function to fetch the send items list
 * @param {Object} mail containing user mail id, username, 
 * To user name, Subject, Body. 
 * @returns Array of send items mail list
 */
export async function defaultOnloadUpdate(mail) {
  let sendEmail = fetch("/defaultPage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mail),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  if (userSendMailData.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
  } else {
    userMenuValues(userSendMailData.reverse());
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
    return userSendMailData;
  }
}

/** Click event to send items menu list tag.
 * Display send items list on click event.
 */
sendItemsMenuButton.addEventListener("click", async function () {
  await defaultOnloadUpdate({ userMailId: currentUserMailId });
  selectedMenuType.innerHTML = "Send items";
  displayEmptyMessage();
});


/** Function to populate section for inbox, send, draft and trash mails.
 * Maipulate DOM dynamically on user update
 * @param {Object} mailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp.
 * Display selected mail on section 3 on click of individual mail from section 2. 
 * Update unreal mail count 
 * Dynamically update send, draft and trash items count.
 */
export function userMenuValues(mailData) {
  let sectionContainer = document.getElementsByClassName(
    "mail-display--container"
  )[0];
  sectionContainer.replaceChildren();
  // console.log(mailData);
  for (let i = 0; i < mailData.length; i++) {
    var mailContainer = document.createElement("div");
    var userName = document.createElement("div");
    var mailSubject = document.createElement("div");
    var mailContentContainer = document.createElement("div");
    var subjectContent = document.createElement("p");
    var mailBodyContent = document.createElement("p");
    sectionContainer.appendChild(mailContainer);
    sectionContainer.appendChild(userName);
    sectionContainer.appendChild(mailSubject);
    sectionContainer.appendChild(mailContentContainer);
    mailContainer.appendChild(userName);
    mailContainer.appendChild(mailSubject);
    mailContainer.appendChild(mailContentContainer);
    mailSubject.appendChild(subjectContent);
    mailContentContainer.appendChild(mailBodyContent);
    mailContainer.setAttribute("class", "mail-list--container");
    userName.setAttribute("class", "mail-userName");
    mailSubject.setAttribute("class", "mail-subject--container");
    mailContentContainer.setAttribute("class", "mail-content--container");
    subjectContent.setAttribute("class", "mail-subject");
    mailBodyContent.setAttribute("class", "mail-content");
    userName.innerHTML = mailData[i][2];
    subjectContent.innerHTML = mailData[i][3];
    let mailContent = mailData[i][4];
    console.log(mailContent);
    mailContent = mailContent.toLocaleString();
    mailContent = mailContent.replaceAll("<br>", "");
    console.log(mailContent);
    mailBodyContent.innerHTML = mailContent;
    // mailBodyContent.innerHTML = mailData[i][4];
    console.log(mailData[i][4]);
    mailContainer.onclick = async function () {
      if (
        selectedMenuType.innerHTML == "Send items" ||
        selectedMenuType.innerHTML == "Trash items"
      ) {
        displaySelectedMail(mailData[i]);
      } else if (selectedMenuType.innerHTML == "Draft items") {
        displayComposeMail(mailData[i]);
        console.log(mailData[i]);
      } else if (selectedMenuType.innerHTML == "Inbox items") {
        displaySelectedMail(mailData[i]);
        fetchDeleteMail(currentUserMailId);
        let unreadCount = await fetchUnreadInboxMail();
        console.log(unreadCount);
        let unreadValue = Object.values(unreadCount);
        inboxCount.innerHTML = unreadValue[0];

        if (mailData[i][6] == "1") {
          // window.alert("In unread");
          mailContent[i].style.fontWeight = "900";
          displaySelectedMail(mailData[i]);
          let changeInbox = await changeReadMessage(mailData[i]);
          console.log(changeInbox);
          let unreadCount = await fetchUnreadInboxMail();
          let unreadValue = Object.values(unreadCount);
          inboxCount.innerHTML = unreadValue[0];
          if (changeInbox["readType"] == "read") {
            mailContent[i].style.fontWeight = "100";
          }
        }
      }
    };
  }
}


/** Async function to display selected mail from inbox, send and trash items list.
 * @param {Object} data containing user mail id, username, 
 * To user name, Subject, Body, Time stamp.
 * On click of each menu button dymanically maipulate section 2 list with userMenuValues function.
 * Fetch data from section 2 and update in section 3.
 * On click of trash icon from send and inbox update to trash.
 * On click of trash icon in trash items permanently delete the mail data.
 * By default display empty message in section 3 after mail is sent / delete / menu change.
 */
export function displaySelectedMail(data) {
  console.log(data);
  composeMailWindow.style.display = "none";
  document.getElementsByClassName("secton3-defaultPage")[0].style.display =
    "none";
  document.getElementsByClassName("section3-contentPage")[0].style.display =
    "block";
  let section3Container = document.getElementsByClassName(
    "section3-contentPage"
  )[0];
  section3Container.replaceChildren();

  // var section3Container = document.createElement("div");
  var topSectionContainer = document.createElement("div");
  var subjectContainer = document.createElement("div");
  var trashIcon = document.createElement("img");
  var userBodyContainer = document.createElement("div");
  var userNameDateContainer = document.createElement("div");
  var userNameDisp = document.createElement("div");
  var DateTimeDisp = document.createElement("div");
  var ToDisp = document.createElement("div");
  var BodyDisp = document.createElement("div");
  section3Container.appendChild(topSectionContainer);
  section3Container.appendChild(subjectContainer);
  section3Container.appendChild(trashIcon);
  section3Container.appendChild(userBodyContainer);
  section3Container.appendChild(userNameDateContainer);
  section3Container.appendChild(userNameDisp);
  section3Container.appendChild(DateTimeDisp);
  section3Container.appendChild(ToDisp);
  section3Container.appendChild(BodyDisp);
  topSectionContainer.appendChild(subjectContainer);
  topSectionContainer.appendChild(trashIcon);
  userBodyContainer.appendChild(userNameDateContainer);
  userBodyContainer.appendChild(userNameDisp);
  userBodyContainer.appendChild(DateTimeDisp);
  userBodyContainer.appendChild(ToDisp);
  userBodyContainer.appendChild(BodyDisp);
  userNameDateContainer.appendChild(userNameDisp);
  userNameDateContainer.appendChild(DateTimeDisp);
  section3Container.setAttribute("class", "section3-contentPage");
  topSectionContainer.setAttribute("class", "section3-container");
  subjectContainer.setAttribute("class", "section3-subject");
  trashIcon.setAttribute("class", "section3-trashicon");
  userBodyContainer.setAttribute("class", "section3-mailcontent--container");
  userNameDateContainer.setAttribute("class", "section3-mail-topsection");
  userNameDisp.setAttribute("class", "section3-userName");
  DateTimeDisp.setAttribute("class", "section3-mail-date");
  ToDisp.setAttribute("class", "section3-mail--Tocontent");
  BodyDisp.setAttribute("class", "section3-mail-bodycontent");
  trashIcon.src = "../Assests/bin.png";
  subjectContainer.innerHTML = data[3];
  userNameDisp.innerHTML = data[0];
  DateTimeDisp.innerHTML = data[5];
  ToDisp.innerHTML = `To: ${data[2]} `;
  BodyDisp.innerHTML = data[4];
  if (selectedMenuType.innerHTML == "Inbox items") {
    subjectContainer.innerHTML = data[3];
    userNameDisp.innerHTML = data[2];
    DateTimeDisp.innerHTML = data[5];
    ToDisp.innerHTML = `To: ${data[0]} `;
    BodyDisp.innerHTML = data[4];
  }
  trashIcon.onclick = async function () {
    let selectMenu = selectedMenuType.innerHTML;
    let deleteMailCheck = {
      userMailId: currentUserMailId,
      SentUserName: data[2],
      Subject: data[3],
      BodyDisp: data[4],
      Date: displayDate(),
      MenuType: selectMenu,
    };

    if (selectedMenuType.innerHTML == "Send items") {
      await getDeleteMailData(deleteMailCheck);
      await defaultOnloadUpdate({ userMailId: currentUserMailId });
      displayEmptyMessage();
      let menuDataCount = await fetchOnloadCount(currentUserMailId);
      sendCount.innerHTML = menuDataCount["send"];
      trashCount.innerHTML = menuDataCount["trash"];
      draftCount.innerHTML = menuDataCount["draft"];
    }
    if (selectedMenuType.innerHTML == "Trash items") {
      await getDeleteMailData(deleteMailCheck);
      let deleteData = await fetchDeleteMail();
      if (deleteData.length == 0) {
        emptyMessage.style.display = "block";
        mailDispContainer.style.display = "none";
        displayEmptyMessage();
        let menuDataCount = await fetchOnloadCount(currentUserMailId);
        sendCount.innerHTML = menuDataCount["send"];
        trashCount.innerHTML = menuDataCount["trash"];
        draftCount.innerHTML = menuDataCount["draft"];
      } else {
        userMenuValues(deleteData);
        displayEmptyMessage();
        console.log(deleteMailCheck);
        emptyMessage.style.display = "none";
        mailDispContainer.style.display = "block";
        let menuDataCount = await fetchOnloadCount(currentUserMailId);
        sendCount.innerHTML = menuDataCount["send"];
        trashCount.innerHTML = menuDataCount["trash"];
        draftCount.innerHTML = menuDataCount["draft"];
      }
    }
    if (selectedMenuType.innerHTML == "Inbox items") {
      await getDeleteMailData(deleteMailCheck);
      let updatedInbox = await fetchInboxMail(currentUserMailId);
      if (updatedInbox.length == 0) {
        emptyMessage.style.display = "block";
        mailDispContainer.style.display = "none";
        displayEmptyMessage();
      } else {
        console.log(updatedInbox);
        userMenuValues(updatedInbox);
        displayEmptyMessage();
        emptyMessage.style.display = "none";
        mailDispContainer.style.display = "block";
        let unreadCount = await fetchUnreadInboxMail();
        console.log(unreadCount);
        let unreadValue = Object.values(unreadCount);
        inboxCount.innerHTML = unreadValue[0];
        console.log(updatedInbox);
        for (let i = 0; i < updatedInbox.length; i++) {
          if (updatedInbox[i][6] == "1") {
            // window.alert("In unread");

            mailContent[i].style.fontWeight = "900";
            mailContent[i].onclick = async function () {
              displaySelectedMail(updatedInbox[i]);
              // mailContent[i].style.backgroundColor = "red";
              let data = await changeReadMessage(updatedInbox[i]);
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
    }
  };
}

/** Function to display message message with image and text
 * Hide the other content sin section 3 and display this message content.
 */
export function displayEmptyMessage() {
  composePage.style.display = "none";
  document.getElementsByClassName("section3-contentPage")[0].style.display =
    "none";

  document.getElementsByClassName("secton3-defaultPage")[0].style.display =
    "block";
}
/** Function to display date and time when the mail is sent.
 * @returns Date and time fo required format.
 */
export function displayDate() {
  var time = new Date();
  let fullTIme = time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  let day = time.getDay();
  let date = time.getDate();
  let month = time.getMonth();
  month = parseInt(month) + 1;
  let year = time.getFullYear();
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let dispDate =
    days[day] + " " + date + "/" + month + "/" + year + " " + fullTIme;
  return dispDate;
}
