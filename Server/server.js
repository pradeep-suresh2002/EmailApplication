// Import required libraries
var express = require("express");
let bodyParser = require("body-parser");
const fs = require("fs");

// Declare the app
var app = express();
// Declare the host port number
var server = app.listen(8000, function () {
  console.log("Started the server");
});
// Link all the assets with index.html
app.use(express.static(process.cwd()));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Fetch the signup data and write the Userdetails.json file 
app.post("/signUpdata", function (req, res) {
  res.json(req.body);
  // console.log(req.body.firstName);
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userDetails.json",
    { encoding: "utf-8" }
  );
  if (currentJsonData == "") {
    let usersLoginData = currentJsonData;

    let updateData = {
      [req.body.userMailId]: {
        firstName: [req.body.firstName],
        lastName: [req.body.lastName],
        mailId: [req.body.userMailId],
        password: [req.body.userPassword],
      },
    };
    let writeUsersLoginData = JSON.stringify(updateData);
    fs.writeFileSync(
      process.cwd() + "/userData/userDetails.json",
      writeUsersLoginData,
      "utf-8"
    );
  } else {
    let usersLoginData = JSON.parse(currentJsonData);
    // console.log(usersLoginData);
    let newData = {
      [req.body.userMailId]: {
        firstName: [req.body.firstName],
        lastName: [req.body.lastName],
        mailId: [req.body.userMailId],
        password: [req.body.userPassword],
      },
    };

    let updatedUsersLoginData = Object.assign(usersLoginData, newData);
    fs.writeFileSync(
      process.cwd() + "/userData/userDetails.json",
      JSON.stringify(updatedUsersLoginData),
      "utf-8"
    );
  }
});

/** Get user login credentials on req.body
 * Compare the current users list on login 
 * And send rresponse as valid or invalid
 */
app.post("/userLoginData", function (req, res) {
  // console.log(req.body);
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userDetails.json",
    { encoding: "utf-8" }
  );
  let validateData = JSON.parse(currentJsonData);
  let userMails = Object.keys(validateData);
  let flag = 0;
  // console.log(userMails[0]);
  for (let i = 0; i < userMails.length; i++) {
    if (req.body.mailId == userMails[i]) {
      if (req.body.password == validateData[req.body.mailId].password) {
        res.send({
          response: "valid",
          firstName: validateData[req.body.mailId].firstName,
          lastName: validateData[req.body.mailId].lastName,
        });
        flag = 0;
        break;
      } else {
        flag = 1;
      }
    } else {
      flag = 1;
    }
  }
  if (flag == 1) {
    res.send({ response: "invalid" });
  }
});


/** Fetch inbox mail data from req.body
 * Update it in current users sent item list and write in userMailData.json file.
 */
app.post("/sendMail", function (req, res) {
  res.json(req.body);
  // console.log(req.body.firstName);
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  if (currentJsonData == "") {
    let usersLoginData = currentJsonData;

    let updateData = {
      [req.body.userMailId]: {
        sendItems: [
          [
            [req.body.userMailId],
            [req.body.userName],
            [req.body.toMailId],
            [req.body.Subject],
            [req.body.Body],
            [req.body.Date],
          ],
        ],
      },
    };
    let writeUsersLoginData = JSON.stringify(updateData);
    fs.writeFileSync(
      process.cwd() + "/userData/userMailData.json",
      writeUsersLoginData,
      "utf-8"
    );
  } else {
    let usersLoginData = JSON.parse(currentJsonData);
    // console.log(usersLoginData);
    let newData = [
      [req.body.userMailId],
      [req.body.userName],
      [req.body.toMailId],
      [req.body.Subject],
      [req.body.Body],
      [req.body.Date],
    ];
    let flag = 0;
    let userMails = Object.keys(usersLoginData);
    for (let i = 0; i < userMails.length; i++) {
      if (req.body.userMailId == userMails[i]) {
        flag = 1;
        break;
      } else {
        flag = 2;
      }
    }
    if (flag == 1) {
      let len = usersLoginData[req.body.userMailId]["sendItems"].length;
      usersLoginData[req.body.userMailId]["sendItems"][len] = newData;
      fs.writeFileSync(
        process.cwd() + "/userData/userMailData.json",
        JSON.stringify(usersLoginData),
        "utf-8"
      );
    }
    if (flag == 2) {
      let usersLoginData = JSON.parse(currentJsonData);
      let updateData = {
        [req.body.userMailId]: {
          sendItems: [
            [
              [req.body.userMailId],
              [req.body.userName],
              [req.body.toMailId],
              [req.body.Subject],
              [req.body.Body],
              [req.body.Date],
            ],
          ],
        },
      };
      let updatedUsersLoginData = Object.assign(usersLoginData, updateData);
      fs.writeFileSync(
        process.cwd() + "/userData/userMailData.json",
        JSON.stringify(updatedUsersLoginData),
        "utf-8"
      );
    }
  }
});

/** Fetch the send items list of logined users
 * Send array of send items list 
 */
app.post("/getSentItems", function (req, res) {
  let updatedMailData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  updatedMailData = JSON.parse(updatedMailData);
  let userUpdatedMail = updatedMailData[req.body.mail]["sendItems"];
  res.send(userUpdatedMail);
});

/** Fetch the send items list of logined users
 * Send array of send items list 
 */
app.post("/defaultPage", function (req, res) {
  let updatedMailData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  updatedMailData = JSON.parse(updatedMailData);
  let userUpdatedMail = updatedMailData[req.body.userMailId]["sendItems"];
  // console.log(userUpdatedMail);
  res.send(userUpdatedMail);
});

/** Delete mail from send items, trash items and inbox items
 * On send items and inbox items delete and update in trash.
 * In trash delete permanently
 */
app.post("/deleteMail", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  console.log(req.body.MenuType[0]);
  let selectedMenu;
  if (req.body.MenuType == "Send items") {
    console.log("Found");
    selectedMenu = "sendItems";
  } else if (req.body.MenuType == "Trash items") {
    selectedMenu = "deleteItems";
  } else if (req.body.MenuType == "Inbox items") {
    selectedMenu = "inboxItems";
  }
  console.log(selectedMenu);
  currentJsonData = JSON.parse(currentJsonData);
  let currentUersMailId = Object.keys(currentJsonData);
  console.log(req.body);
  let flag = 0;
  for (let i = 0; i < currentUersMailId.length; i++) {
    if (currentUersMailId[i] == req.body.userMailId) {
      flag = 1;
    }
  }
  if (flag == 1) {
    let sendItemsLength =
      currentJsonData[req.body.userMailId][selectedMenu].length;
    let removeArrayIndex;
    for (let i = 0; i < sendItemsLength; i++) {
      if (
        currentJsonData[req.body.userMailId][selectedMenu][i][3] ==
          req.body.Subject[0] &&
        currentJsonData[req.body.userMailId][selectedMenu][i][4] ==
          req.body.BodyDisp[0]
      ) {
        removeArrayIndex = i;
      }
    }
    let deletedMail =
      currentJsonData[req.body.userMailId][selectedMenu][removeArrayIndex];
    // console.log(deletedMail[0]);
    currentJsonData[req.body.userMailId][selectedMenu].splice(
      removeArrayIndex,
      1
    );

    let deleteMailContent = [
      deletedMail[0],
      deletedMail[1],
      deletedMail[2],
      deletedMail[3],
      deletedMail[4],
      deletedMail[5],
    ];

    let updateData = JSON.stringify(currentJsonData);
    // console.log(currentJsonData[req.body.userMailId].sendItems);
    fs.writeFileSync(
      process.cwd() + "/userData/userMailData.json",
      updateData,
      "utf-8"
    );
    if (selectedMenu == "sendItems" || selectedMenu == "inboxItems") {
      let copyObject = { ...currentJsonData };
      if (copyObject[req.body.userMailId]["deleteItems"] == undefined) {
        copyObject[req.body.userMailId]["deleteItems"] = [deleteMailContent];
      } else {
        copyObject[req.body.userMailId]["deleteItems"].push(deleteMailContent);
      }
      fs.writeFileSync(
        process.cwd() + "/userData/userMailData.json",
        JSON.stringify(copyObject),
        "utf-8"
      );
      res.send(copyObject);
    } else {
      res.send(currentJsonData);
    }
  }
});

/** Fetch the delete mail items of logined user
 * Send the array of lsit of deleted mails in trash list
 */
app.post("/trashMenu", function (req, res) {
  let updatedMailData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  updatedMailData = JSON.parse(updatedMailData);
  let userUpdatedMail = updatedMailData[req.body.mail]["deleteItems"];
  res.send(userUpdatedMail);
});

/** Add mail contents to draft items
 * Update the userMailData.json file
 */
app.post("/discardMail", function (req, res) {
  let currentMailData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentMailData = JSON.parse(currentMailData);
  let draftMailContent = [
    [req.body.userMailId],
    [req.body.userName],
    [req.body.ToMailId],
    [req.body.Subject],
    [req.body.BodyDisp],
    [req.body.Date],
  ];
  console.log(req.body);

  if (currentMailData[req.body.userMailId]["draftItems"] == undefined) {
    console.log("Undefined");
    currentMailData[req.body.userMailId]["draftItems"] = [draftMailContent];
  } else {
    currentMailData[req.body.userMailId]["draftItems"].push(draftMailContent);
  }

  fs.writeFileSync(
    process.cwd() + "/userData/userMailData.json",
    JSON.stringify(currentMailData),
    "utf-8"
  );
  res.send(currentMailData);
  console.log(currentMailData);
});


/** Fetch the draft item list of logined user
 * Send array of draft item list
 */
app.post("/fetchDraftMail", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  res.send(currentJsonData[req.body.userMailId]["draftItems"]);
});

/** Delete contents from draft items
 * Update the userMailData.json file
 * Send array of draft mail list
 */
app.post("/deleteDiscardMail", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  let currentUersMailId = Object.keys(currentJsonData);
  let flag = 0;
  for (let i = 0; i < currentUersMailId.length; i++) {
    if (currentUersMailId[i] == req.body.userMailId) {
      flag = 1;
      console.log("found");
    }
  }
  if (flag == 1) {
    let sendItemsLength =
      currentJsonData[req.body.userMailId]["draftItems"].length;
    let removeArrayIndex;

    for (let i = 0; i < sendItemsLength; i++) {
      if (
        currentJsonData[req.body.userMailId]["draftItems"][i][2][0] ==
          req.body.Subject[0] &&
        currentJsonData[req.body.userMailId]["draftItems"][i][3][0] ==
          req.body.BodyDisp[0]
      ) {
        removeArrayIndex = i;
      }
    }
    let deletedMail =
      currentJsonData[req.body.userMailId]["draftItems"][removeArrayIndex];
    currentJsonData[req.body.userMailId]["draftItems"].splice(
      removeArrayIndex,
      1
    );

    let updateData = JSON.stringify(currentJsonData);
    console.log(updateData);
    fs.writeFileSync(
      process.cwd() + "/userData/userMailData.json",
      updateData,
      "utf-8"
    );
    res.send(currentJsonData[req.body.userMailId]["draftItems"]);
  }
});

/** Update content to other users inbox based on To mail id
 * Update the userMailData.json for inbox items
 * Send array lsit of inbox items
 */
app.post("/sendInboxMail", function (req, res) {
  console.log(req.body);
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  let inboxContent = [
    [req.body.userMailId],
    [req.body.userName],
    [req.body.toMailId],
    [req.body.Subject],
    [req.body.Body],
    [req.body.Date],
    [1],
  ];
  currentJsonData = JSON.parse(currentJsonData);
  let userMail = Object.keys(currentJsonData);
  const otherUsers = userMail.filter(function (mail) {
    return mail !== req.body.userMailId;
  });

  // let inboxArray = [];
  console.log(req.body.toMailId);
  console.log(currentJsonData[otherUsers[0]]);

  for (let i = 0; i < otherUsers.length; i++) {
    if (req.body.toMailId == otherUsers[i]) {
      if (currentJsonData[otherUsers[i]]["inboxItems"] == undefined) {
        currentJsonData[otherUsers[i]]["inboxItems"] = [inboxContent];
      } else {
        currentJsonData[otherUsers[i]]["inboxItems"].push(inboxContent);
        console.log("FOund");
      }
    }
  }
  console.log(currentJsonData);
  fs.writeFileSync(
    process.cwd() + "/userData/userMailData.json",
    JSON.stringify(currentJsonData),
    "utf-8"
  );
  res.send(currentJsonData[req.body.userMailId]);
});

// Send inbox list of logined user
app.post("/fetchInboxMail", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  res.send(currentJsonData[req.body.userMailId]["inboxItems"]);
});

/** Fetch count of send, draft and trash items list.
 * Return of object of each counts
 */
app.post("/fetchOnload", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  let userMails = Object.keys(currentJsonData);
  console.log(userMails.length);
  let userCheck = 0;
  for (let i = 0; i < userMails.length; i++) {
    if (req.body.userMailId == userMails[i]) {
      userCheck = 1;

      break;
    } else {
      userCheck = 0;
    }
  }
  if (userCheck == 0) {
    let updateData = {
      [req.body.userMailId]: {
        sendItems: [],
        draftItems: [],
        deleteItems: [],
        inboxItems: [],
      },
    };
    let updatedUsersLoginData = Object.assign(currentJsonData, updateData);
    console.log(updatedUsersLoginData);
    fs.writeFileSync(
      process.cwd() + "/userData/userMailData.json",
      JSON.stringify(updatedUsersLoginData),
      "utf-8"
    );
  }
  console.log(req.body);
  res.send(req.body);
});

/** Change unreads message to read on click event
 * Update the userMailData.json file
 */
app.post("/changeReadInbox", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  let inputLength = currentJsonData[req.body[0]]["inboxItems"].length;
  for (let i = 0; i < inputLength; i++) {
    if (currentJsonData[req.body[0]]["inboxItems"][i][6] == 1) {
      console.log(currentJsonData[req.body[0]]["inboxItems"][i][0]);
      if (
        currentJsonData[req.body[0]]["inboxItems"][i][0][0] == req.body[2][0] &&
        currentJsonData[req.body[0]]["inboxItems"][i][3][0] == req.body[3][0] &&
        currentJsonData[req.body[0]]["inboxItems"][i][4][0] == req.body[4][0] &&
        currentJsonData[req.body[0]]["inboxItems"][i][5][0] == req.body[5][0]
      ) {
        currentJsonData[req.body[0]]["inboxItems"][i][6] = [0];
      }
    }
  }
  fs.writeFileSync(
    process.cwd() + "/userData/userMailData.json",
    JSON.stringify(currentJsonData),
    "utf-8"
  );
  res.send({ readType: "read" });
});

/** Fetch unread mail list from userMailData.json
 * Send array of unread mail list
 */
app.post("/fetchUnreadInboxMail", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  let inputLength = currentJsonData[req.body.userMailId]["inboxItems"].length;
  let count = 0;
  for (let i = 0; i < inputLength; i++) {
    if (currentJsonData[req.body.userMailId]["inboxItems"][i][6] == 1) {
      count++;
    }
  }
  console.log({ unreadMail: count });
  res.send({ unreadMailCount: count });
});
app.post("/fetchCount", function (req, res) {
  let currentJsonData = fs.readFileSync(
    process.cwd() + "/userData/userMailData.json",
    { encoding: "utf-8" }
  );
  currentJsonData = JSON.parse(currentJsonData);
  let trashLength = currentJsonData[req.body.userMailId]["deleteItems"].length;
  let draftLength = currentJsonData[req.body.userMailId]["draftItems"].length;
  let sendLength = currentJsonData[req.body.userMailId]["sendItems"].length;
  res.send({ trash: trashLength, draft: draftLength, send: sendLength });
});
