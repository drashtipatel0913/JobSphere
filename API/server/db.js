require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const {
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pdf = require("pdf-parse");
const fs = require("fs");
const stopword = require("stopword");
let db;

// Function to connect to the MongoDB database
async function connect_to_db() {
  try {
    // Create a new MongoClient instance with the provided database URL
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    console.log("connected to DB");
    db = client.db();
  } catch (error) {
    console.log(error);
  }
}

// Function to retrieve all users from the database
async function getDBUsers() {
  const users = await db.collection("User").find({}).toArray();
  return users;
}

// update read status
async function UpdateDBReadStatus(senderID, receiverID) {
  // Update documents in the Messages collection where receiver ID matches
  const result = await db.collection("Messages").updateMany(
    { senderID: new ObjectId(senderID), receiverID: new ObjectId(receiverID) }, // Filter criteria
    { $set: { readStatus: true } } // Update operation to set status to true
  );

  if (result) {
    return true;
  } else {
    return false;
  }
}

async function UpdateDBNotificationStatus(userId) {
  // Update documents in the Notifications collection where userId matches
  const result = await db.collection("Notifications").updateMany(
    { userId: new ObjectId(userId) }, // Filter criteria
    { $set: { readStatus: true } } // Update operation to set status to true
  );

  if (result.modifiedCount > 0) {
    // If any documents were updated
    const updatedEntry = await db.collection("Notifications").findOne(
      { userId: new ObjectId(userId) } // Filter criteria to find one of the updated documents
    );
    return updatedEntry; // Return one of the updated documents
  } else {
    return null; // If no documents were updated, return null
  }
}


async function getDBMessages() {
  const messages = await db.collection("Messages").find({}).toArray();
  return messages;
}
async function getDBNotifications(userId) {
  const messages = await db
    .collection("Notifications")
    .find({ userId: new ObjectId(userId) })
    .sort({ timestamp: -1 }) // Sorting by timestamp in descending order
    .limit(10) // Limiting the result to top ten notifications
    .toArray();

  return messages;
}

async function sendDBMessage(message) {
  message.senderID = new ObjectId(message.senderID);
  message.receiverID = new ObjectId(message.receiverID);
  const messages = await db.collection("Messages").insertOne(message);
  // console.log(messages);
  const msg = await db.collection("Messages").findOne({
    _id: new ObjectId(messages.insertedId),
  });
  return msg;
}
async function addDBNotification(notification) {
  notification.userId = new ObjectId(notification.userId);
  const noti = await db.collection("Notifications").insertOne(notification);
  // console.log(noti);
  const notiAdded = await db.collection("Notifications").findOne({
    _id: new ObjectId(noti.insertedId),
  });
  return notiAdded;
}
async function getDBMessageList(userType) {
  let query = {};
  if (userType === "user") {
    query = { UserType: "employer" };
  } else if (userType === "employer") {
    query = { UserType: "user" };
  }
  if (userType === "user") {
    const users = await db
      .collection("User")
      .aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "Employer",
            localField: "_id",
            foreignField: "userId",
            as: "employerData",
          },
        },
        {
          $unwind: "$employerData",
        },
        {
          $project: {
            _id: 1,
            FirstName: 1,
            LastName: 1,
            Email: 1,
            Contact: 1,
            UserType: 1,
            salary: 1,
            ProfilePicture: 1,
            CompanyName: "$employerData.CompanyName",
            CompanyLogo: "$employerData.CompanyLogo",
          },
        },
      ])
      .toArray();
    return users;
  } else if (userType === "employer") {
    const users = await db.collection("User").find(query).toArray();
    return users;
  }
}

async function SingleDBJob(id) {
  const jobWithCompanyName = await db
    .collection("Job")
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "Employer",
          localField: "employerId",
          foreignField: "_id",
          as: "employerData",
        },
      },
      {
        $unwind: "$employerData",
      },
      {
        $project: {
          _id: 1,
          jobTitle: 1,
          jobType: 1,
          jobCategory: 1,
          jobLocation: 1,
          jobDescription: 1,
          salary: 1,
          employerId: 1,
          datePosted: 1,
          userId: 1,
          CompanyName: "$employerData.CompanyName",
          CompanyLogo: "$employerData.CompanyLogo",
        },
      },
    ])
    .toArray(); // Convert the cursor to an array

  return jobWithCompanyName[0]; // Assuming there's only one result
}

// Function to retrieve all users from the database
async function getDBEmployer(userId) {
  const user = await db.collection("User").findOne({
    _id: new ObjectId(userId),
  });
  const employer = await db.collection("Employer").findOne({
    userId: new ObjectId(userId),
  });
  if (user) {
    if (employer) {
      // Merge user and employer data
      return {
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Contact: user.Contact,
        ProfilePicture: user.ProfilePicture,
        CompanyName: employer.CompanyName,
        CompanyDescription: employer.CompanyDescription,
        Industry: employer.Industry,
        Website: employer.Website,
        CompanyLogo: employer.CompanyLogo,
      };
    } else {
      return {
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Contact: user.Contact,
        ProfilePicture: user.ProfilePicture,
      };
    }
  }
}

async function getDBJobs() {
  const jobsWithCompanyName = await db
    .collection("Job")
    .aggregate([
      {
        $lookup: {
          from: "Employer",
          localField: "employerId",
          foreignField: "_id",
          as: "employerData",
        },
      },
      {
        $unwind: "$employerData",
      },
      {
        $project: {
          _id: 1,
          jobTitle: 1,
          jobType: 1,
          jobCategory: 1,
          jobLocation: 1,
          jobDescription: 1,
          salary: 1,
          employerId: 1,
          datePosted: 1,
          CompanyName: "$employerData.CompanyName",
          CompanyLogo: "$employerData.CompanyLogo",
        },
      },
      {
        $sort: { datePosted: -1 } // Sort by datePosted in descending order (newest first)
      }
    ])
    .toArray();
  return jobsWithCompanyName;
}

// Function to retrieve all users from the database
async function GetDBJobByEmployer(id) {
  const emp = await db.collection("Employer").findOne({
    userId: new ObjectId(id),
  });
  const jobsByEmployer = await db
    .collection("Job")
    .find({ employerId: emp._id })
    .toArray();
  return jobsByEmployer;
}
async function updateDbUser(id, user) {
  const existingUser = await db
    .collection("User")
    .findOne({ _id: new ObjectId(id) });
  if (existingUser) {
    if (user.Resume && Array.isArray(user.Resume)) {
      // Check if the length of the resume array is 5
      console.log(user);
      console.log(user.Resume);
      console.log(user.Resume.length);
      if (user.Resume.length !== 5) {
        // Append new elements to the existing resume array
        user.Resume = existingUser.Resume.concat(user.Resume);
      }
    }
    console.log(user.Resume);
    if (user.Resume) {
      await db
        .collection("User")
        .updateOne({ _id: new ObjectId(id) }, { $set: { Resume: [] } }); // Clear the existing array

      await db
        .collection("User")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { Resume: user.Resume } }
        );
    }
    delete user.Resume;
    console.log(user);
    const updatedUser = await db
      .collection("User")
      .updateOne({ _id: new ObjectId(id) }, { $set: user });
    return updatedUser;
  } else {
    // Handle the case where the user with the given ID is not found
    throw new Error(`User with ID ${id} not found`);
  }
}
async function deleteDBResumes(id, resumesToDelete) {
  console.log(resumesToDelete);
  const existingUser = await db
    .collection("User")
    .findOne({ _id: new ObjectId(id) });

  if (existingUser) {
    if (existingUser.Resume && Array.isArray(existingUser.Resume)) {
      // Filter out the resumes to delete
      existingUser.Resume = existingUser.Resume.filter(
        (resume) => !resumesToDelete.includes(resume)
      );
    }

    const updatedUser = await db
      .collection("User")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { Resume: existingUser.Resume } }
      );

    return updatedUser;
  } else {
    // Handle the case where the user with the given ID is not found
    throw new Error(`User with ID ${id} not found`);
  }
}
async function applicationDBCheck(userId, jobId) {
  const appdetails = await db
    .collection("Application")
    .findOne({ userId: new ObjectId(userId), jobId: new ObjectId(jobId) });
  if (appdetails) {
    return true;
  } else {
    return false;
  }
}
async function getDBUserDetails(id) {
  const userdetails = await db
    .collection("User")
    .findOne({ _id: new ObjectId(id) });
  return userdetails;
}
async function GetDBJobByJobId(id) {
  const jobdetails = await db
    .collection("Job")
    .findOne({ _id: new ObjectId(id) });
  return jobdetails;
}
async function updateDBEmployer(id, employer) {
  employer.userId = new ObjectId(employer.userId);
  const userdetails = await db
    .collection("Employer")
    .updateOne(
      { userId: new ObjectId(id) },
      { $set: employer },
      { upsert: true }
    );
  return userdetails;
}
async function getDBJobById(id) {
  const applications = await db
    .collection("Application")
    .aggregate([
      {
        $match: {
          userId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "Job",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "Employer",
          localField: "job.employerId",
          foreignField: "_id",
          as: "employer",
        },
      },
      {
        $unwind: "$employer",
      },
      {
        $project: {
          _id: 1,
          jobTitle: "$job.jobTitle",
          jobType: "$job.jobType",
          jobCategory: "$job.jobCategory",
          jobLocation: "$job.jobLocation",
          jobDescription: "$job.jobDescription",
          salary: "$job.salary",
          CompanyName: "$employer.CompanyName",
          Status: 1,
          education: 1,
          experience: 1,
          skills: 1,
          availabilities: 1,
          appliedDate: 1,
          resume: 1,
        },
      },
      {
        $sort: { appliedDate: -1 } // Sort by appliedDate in descending order (newest first)
      }
    ])
    .toArray();
  return applications;
}
async function GetDBJobByResume(resume) {
  const application = await db
    .collection("Application")
    .aggregate([
      {
        $match: {
          resume,
        },
      },
      {
        $lookup: {
          from: "Job",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "Employer",
          localField: "job.employerId",
          foreignField: "_id",
          as: "employer",
        },
      },
      {
        $unwind: "$employer",
      },
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          jobTitle: "$job.jobTitle",
          CompanyName: "$employer.CompanyName",
          FirstName: "$user.FirstName",
          LastName: "$user.LastName",
        },
      },
    ])
    .limit(1) // Limit to fetch only one document
    .toArray();
  return application[0]; // Return the first document from the result array
}


async function getDBAdminApp() {
  const applications = await db
    .collection("Application")
    .aggregate([
      {
        $lookup: {
          from: "Job",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "Employer",
          localField: "job.employerId",
          foreignField: "_id",
          as: "employer",
        },
      },
      {
        $unwind: "$employer",
      },
      {
        $lookup: {
          from: "User",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          jobTitle: "$job.jobTitle",
          jobType: "$job.jobType",
          jobCategory: "$job.jobCategory",
          jobLocation: "$job.jobLocation",
          jobDescription: "$job.jobDescription",
          salary: "$job.salary",
          CompanyName: "$employer.CompanyName",
          CompanyLogo: "$employer.CompanyLogo",
          FirstName: "$user.FirstName", // Assuming userName exists in the User collection
          LastName: "$user.LastName", // Assuming userName exists in the User collection
          userId: "$user._id", // Assuming userName exists in the User collection
          education: 1,
          experience: 1,
          skills: 1,
          availabilities: 1,
          appliedDate: 1,
          resume: 1,
        },
      },
      {
        $sort: { appliedDate: -1 } // Sort by appliedDate in descending order (newest first)
      }
    ])
    .toArray();
  return applications;
}


async function getDBEmployerById(id) {
  const employer = await db
    .collection("Employer")
    .findOne({ userId: new ObjectId(id) });
  if (employer) {
    return true;
  } else {
    return false;
  }
}
async function passwordDBCheck(id, password) {
  try {
    // Fetch the user details from the database
    const user = await db.collection("User").findOne({ _id: new ObjectId(id) });

    if (!user) {
      // User not found
      return false;
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (passwordMatch) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // Handle errors, e.g., log them or throw an exception
    console.error("Error checking password:", error);
    return false; // Return false in case of an error
  }
}
async function updateDBPassword(id, password) {
  try {
    let hashedPassword = await bcrypt.hash(password, 12);
    // Fetch the user details from the database
    const user = await db
      .collection("User")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { Password: hashedPassword } }
      );

    if (user) {
      // User not found
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // Handle errors, e.g., log them or throw an exception
    console.error("Error updating password:", error);
    return false; // Return false in case of an error
  }
}

// Function to create a new user and generate a JWT
async function CreateDBUsers(user) {
  let createUser = "";
  const { Email } = user;

  try {
    const existingUser = await db.collection("User").findOne({ Email });

    if (existingUser) {
      throw new UserInputError("User already exists");
    }
    // Ensure that user.Resume is an array
    user.Resume = Array.isArray(user.Resume) ? user.Resume : [user.Resume];

    // Create a new user in the database
    createUser = await db.collection("User").insertOne(user);

    return { user: createUser };
  } catch (error) {
    console.error(error);
    throw new Error("Error creating user");
  }
}
async function CreateDBJobs(Job, userId) {
  try {
    const Employer = await db
      .collection("Employer")
      .findOne({ userId: new ObjectId(userId) });

    Job.employerId = Employer._id;
    Job.userId = new ObjectId(userId);
    const JobPost = await db.collection("Job").insertOne(Job);
    const addedJob = await db.collection("Job").findOne({
      _id: new ObjectId(JobPost.insertedId),
    });
    return addedJob;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating Job");
  }
}

async function validateDBEmail(email) {
  const existingUser = await db.collection("User").findOne({ Email: email });
  return !existingUser;
}
async function validateDBUpdateEmail(email,id) {
  const existingUser = await db.collection("User").findOne({ Email: email });
  const currentEmail = await db.collection("User").findOne({ _id: new ObjectId(id) });
  if(currentEmail.Email === email){
    return true;
  }
  return !existingUser;
}
async function AppDBCount() {
  const apps = await db.collection("Application").countDocuments();
  return apps;
}
async function msgDBCount(receiverID) {
  const query = { receiverID: new ObjectId(receiverID), readStatus: false };
  const msgs = await db.collection("Messages").countDocuments(query);
  return msgs;
}

async function JobDBCount() {
  const jobs = await db.collection("Job").countDocuments();
  return jobs;
}
async function deleteDBApp(appId) {
  const deleteapp = await db
    .collection("Application")
    .deleteOne({ _id: new ObjectId(appId) });
  if (deleteapp) {
    return true;
  } else {
    return false;
  }
}
async function getDBApplications() {
  const app = await db.collection("Application").find({}).toArray();
  return app;
}
function removeHtmlTagsAndPunctuation(html) {
  const cleanText = html
    .replace(/<[^>]*>/g, " ") // Replace HTML tags with space
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/[^\w\s]/g, " ") // Replace punctuation with space
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Trim leading and trailing spaces

  // Split the clean text into words, filter out repeated words, and join them back
  const uniqueWords = cleanText.split(" ").filter((word, index, self) => {
    return self.indexOf(word) === index;
  });
  return uniqueWords.join(" ");
}

function extractKeywords(text) {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

function calculateKeywordMatchPercentage(jobKeywords, appKeyword) {
  const jobKeywordsCount = jobKeywords.length;
  let matchCount = 0;

  // Count the occurrences of each keyword from jobKeywords in appKeyword
  for (const keyword of jobKeywords) {
    if (appKeyword.includes(keyword)) {
      matchCount++;
    }
  }
  // Calculate the percentage
  const percentage = (matchCount / jobKeywordsCount) * 100;
  return percentage;
}

async function AddDBJobApplication(App, jobId, userId) {
  App.jobId = new ObjectId(jobId);
  App.userId = new ObjectId(userId);
  const job = await db
    .collection("Job")
    .findOne({ _id: new ObjectId(App.jobId) });

  // console.log(App);
  let resumepath = fs.readFileSync(`./public/resume/${App.resume}`);
  const resumeText = await pdf(resumepath).then((data) => data.text);
  const appText = resumeText + App.education + App.experience + App.skills;
  // console.log("jobKeywords", jobKeywords);
  // console.log("resumeText", resumeText);
  //console.log("appText", removeHtmlTagsAndPunctuation(appText));
  try {
    const jobKeywords = job.jobKeywords;
    const combinedjobs = jobKeywords.join(" ");
    const appKeyword = stopword.removeStopwords(
      extractKeywords(removeHtmlTagsAndPunctuation(appText))
    );
    const jobKeyword = stopword.removeStopwords(
      extractKeywords(removeHtmlTagsAndPunctuation(combinedjobs))
    );
    //console.log(appKeyword);
    const matchPercentage = calculateKeywordMatchPercentage(
      jobKeyword,
      appKeyword
    );
    App.atsScore = matchPercentage;
    console.log("Match Percentage:", matchPercentage.toFixed(2) + "%");
  } catch (error) {
    throw new UserInputError("Error generating score", { error });
  }
  const app = await db.collection("Application").insertOne(App);
  return app;
}
async function UpdateDBJobPost(job, data) {
  const updatePost = await db
    .collection("Job")
    .updateOne({ _id: new ObjectId(job) }, { $set: data });
  if (updatePost) {
    return true;
  } else {
    return false;
  }
}
async function UpdateDBStatus(id, Status) {
  const updateStatus = await db
    .collection("Application")
    .updateOne({ _id: new ObjectId(id) }, { $set: { Status } });
  if (updateStatus) {
    return true;
  } else {
    return false;
  }
}

async function EmployerDBApplications(id) {
  const applications = await db
    .collection("Employer")
    .aggregate([
      {
        $match: {
          userId: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "Job",
          localField: "_id",
          foreignField: "employerId",
          as: "job",
        },
      },
      {
        $unwind: "$job",
      },
      {
        $lookup: {
          from: "Application",
          localField: "job._id",
          foreignField: "jobId",
          as: "applications",
        },
      },
      {
        $unwind: "$applications",
      },
      {
        $lookup: {
          from: "User",
          localField: "applications.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: "$applications._id",
          jobTitle: "$job.jobTitle",
          jobType: "$job.jobType",
          jobCategory: "$job.jobCategory",
          jobLocation: "$job.jobLocation",
          jobDescription: "$job.jobDescription",
          salary: "$job.salary",
          CompanyName: 1,
          Status: "$applications.Status",
          education: "$applications.education",
          experience: "$applications.experience",
          skills: "$applications.skills",
          availabilities: "$applications.availabilities",
          resume: "$applications.resume",
          appliedDate: "$applications.appliedDate",
          atsScore: "$applications.atsScore",
          FirstName: "$user.FirstName",
          LastName: "$user.LastName",
          Email: "$user.Email",
          userId: "$user._id",
          Contact: "$user.Contact",
        },
      },
    ])
    .toArray();
  return applications;
}
async function getDBAdminUser() {
  const adminuserdetails = await db
    .collection("User")
    .aggregate([
      {
        $match: {
          UserType: { $ne: "admin" },
        },
      },
      {
        $lookup: {
          from: "Application",
          localField: "_id",
          foreignField: "userId",
          as: "userApplications",
        },
      },
      {
        $lookup: {
          from: "Job",
          localField: "_id",
          foreignField: "userId",
          as: "employerJobs",
        },
      },
      {
        $lookup: {
          from: "Employer",
          localField: "_id",
          foreignField: "userId",
          as: "employerData",
        },
      },
      {
        $addFields: {
          AppCount: {
            $cond: {
              if: { $eq: ["$UserType", "user"] },
              then: { $size: "$userApplications" },
              else: "",
            },
          },
          JobCount: {
            $cond: {
              if: { $eq: ["$UserType", "employer"] },
              then: { $size: "$employerJobs" },
              else: "",
            },
          },
          CompanyName: {
            $cond: {
              if: { $eq: ["$UserType", "employer"] },
              then: { $arrayElemAt: ["$employerData.CompanyName", 0] },
              else: "-",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Contact: 1,
          UserType: 1,
          CompanyName: 1,
          ApplicationCount: 1,
          JobCount: 1,
          AppCount: 1,
        },
      },
    ])
    .toArray();
  return adminuserdetails;
}
async function GetDBJobsforAts() {
  const atsJobs = await db
    .collection("Job")
    .aggregate([
      {
        $lookup: {
          from: "Employer",
          localField: "employerId",
          foreignField: "_id",
          as: "employerData",
        },
      },
      {
        $unwind: "$employerData",
      },
      {
        $project: {
          _id: 1,
          jobTitle: 1,
          CompanyName: "$employerData.CompanyName",
        },
      },
    ])
    .toArray();
  return atsJobs;
}
async function ResumeDBChecker(id) {
  const job = await db.collection("Job").findOne({ _id: new ObjectId(id) });
  return job;
}
async function fetchDBChatMessages(senderID, receiverID) {
  const chatMessages = await db
    .collection("Messages")
    .find({
      $or: [
        {
          $and: [
            { senderID: new ObjectId(senderID) },
            { receiverID: new ObjectId(receiverID) },
          ],
        },
        {
          $and: [
            { senderID: new ObjectId(receiverID) },
            { receiverID: new ObjectId(senderID) },
          ],
        },
      ],
    })
    .toArray();
  return chatMessages;
}

async function deleteDBJobApp(jobId) {
  const deleteApp = await db
    .collection("Application")
    .deleteMany({ jobId: new ObjectId(jobId) });
  if (deleteApp) {
    const deleteJob = await db
      .collection("Job")
      .deleteOne({ _id: new ObjectId(jobId) });
    if (deleteJob) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
let timeoutId;
async function AuthenticateDBUser(email, password) {
  const existingUser = await db.collection("User").findOne({ Email: email });

  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.Password
    );

    if (isPasswordValid) {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: existingUser._id,
          email: existingUser.Email,
          fname: existingUser.FirstName,
          lname: existingUser.LastName,
          userType: existingUser.UserType,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      return { success: true, token: token };
    } else {
      throw new AuthenticationError("Invalid Password");
    }
  } else {
    throw new AuthenticationError("User does not exist");
  }
}

module.exports = {
  connect_to_db,
  getDBUsers,
  CreateDBUsers,
  validateDBEmail,
  AuthenticateDBUser,
  getDBJobs,
  updateDBPassword,
  CreateDBJobs,
  getDBEmployer,
  getDBUserDetails,
  getDBJobById,
  getDBApplications,
  getDBEmployerById,
  AddDBJobApplication,
  applicationDBCheck,
  updateDbUser,
  AppDBCount,
  JobDBCount,
  GetDBJobByEmployer,
  fetchDBChatMessages,
  getDBAdminUser,
  UpdateDBStatus,
  deleteDBApp,
  getDBMessages,
  msgDBCount,
  UpdateDBReadStatus,
  sendDBMessage,
  addDBNotification,
  getDBAdminApp,
  deleteDBResumes,
  UpdateDBJobPost,
  passwordDBCheck,
  EmployerDBApplications,
  GetDBJobsforAts,
  SingleDBJob,
  GetDBJobByJobId,
  getDBNotifications,
  validateDBUpdateEmail,
  getDBMessageList,
  deleteDBJobApp,
  ResumeDBChecker,
  GetDBJobByResume,
  updateDBEmployer,
  UpdateDBNotificationStatus,
};
