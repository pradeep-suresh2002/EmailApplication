// Import neccessary modules and libraries
import { currentUserMailId } from "./userLogin.js";
import { userMenuValues } from "./userSendMail.js";
import { emptyMessage, mailDispContainer } from "./userLogin.js";
import { displayEmptyMessage } from "./userSendMail.js";
import { displaySelectedMail } from "./userSendMail.js";

// Export common global HTML elements
export let mailContent = document.getElementsByClassName(
  "mail-list--container"
);
export let inboxCount = document.getElementsByClassName("menu-count")[0];

// Declare global HTML elements
let selectedMenuType = document.getElementsByClassName("selected-items")[0];
let inboxButton = document.getElementsByClassName("menu-container")[0];

/** Async function to fetch inbox mail contents
 * @param {string} mailId of logined user 
 * @returns Array of Array containing user's MailId, user's name, To MailId, Subject, Body,
 * Time stamp of when mail is sent and number 0 or 1 respresenting the read status of mail 
 */
export async function fetchInboxMail(mailId) {
  let getStatus = fetch("/fetchInboxMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMailId: mailId }),
  });
  let data = await getStatus;
  let output = await data.json();
  console.log(output);
  return output.reverse();
}

/** Click event listener for inbox button
 * Display inbox mail list on section2
 * Display empty message on default or if any specific mail is not selected or when mail is deleted
 * Display unread mail count near inbox button
 * Display unread amils with increased font weight.
 * Display selected mail on section3
 */
inboxButton.addEventListener("click", async function () {
  let inboxData = await fetchInboxMail(currentUserMailId);
  displayEmptyMessage();
  console.log(inboxData);
  for (let i = 0; i < inboxData.length; i++) {
    let userMail = inboxData[i][0];
    inboxData[i][0] = inboxData[i][2];
    inboxData[i][2] = userMail;
  }
  console.log(inboxData);
  selectedMenuType.innerHTML = "Inbox items";
  // let sortedinboxData = inboxData.reverse();
  if (inboxData.length == 0) {
    emptyMessage.style.display = "block";
    mailDispContainer.style.display = "none";
    inboxCount.innerHTML = 0;
  } else {
    userMenuValues(inboxData);
    emptyMessage.style.display = "none";
    mailDispContainer.style.display = "block";
    let unreadCount = await fetchUnreadInboxMail();
    unreadCount = unreadCount.unreadMailCount;
    inboxCount.innerHTML = unreadCount;

    console.log(unreadCount.unreadMailCount);
    for (let i = 0; i < inboxData.length; i++) {
      if (inboxData[i][6] == "1") {
        // window.alert("In unread");

        mailContent[i].style.fontWeight = "900";
        mailContent[i].onclick = async function () {
          displaySelectedMail(inboxData[i]);
          // mailContent[i].style.backgroundColor = "red";
          let data = await changeReadMessage(inboxData[i]);
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
});

/** Async function to send mail to other users
 * @param {Object} mailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp, Numberrepersenting read status
 */
export async function inboxMail(mailData) {
  let sendEmail = fetch("/sendInboxMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailData),
  });
  let userSendMail = await sendEmail;
  let userSendMailData = await userSendMail.json();
  console.log(userSendMailData);
}

/** Async function to change unread message to read
 * @param {Object} mailData containing user mail id, username, 
 * To user name, Subject, Body, Time stamp, Numberrepersenting read status
 * @returns Array of array chaging the status of read message
 */
export async function changeReadMessage(mailData) {
  let getStatus = fetch("/changeReadInbox", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mailData),
  });
  let data = await getStatus;
  let output = await data.json();
  console.log(output);
  return output;
}

/** Async function to fetch unread mails
 * Reads the data of selected user mail id
 * @returns Array of array containing unread mail contents
 */
export async function fetchUnreadInboxMail() {
  let getStatus = fetch("/fetchUnreadInboxMail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMailId: currentUserMailId }),
  });
  let data = await getStatus;
  let output = await data.json();
  return output;
}
