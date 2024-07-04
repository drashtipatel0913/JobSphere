require("dotenv").config();
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const { UserInputError } = require("apollo-server-express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const stopword = require("stopword");
const { decodeJWTToken } = require("./auth");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const OpenAI = require("openai");
// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

const {
  getDBUsers,
  CreateDBUsers,
  validateDBEmail,
  validateDBUpdateEmail,
  GetDBJobByJobId,
  GetDBJobByResume,
  getDBMessages,
  getDBNotifications,
  UpdateDBNotificationStatus,
  sendDBMessage,
  addDBNotification,
  deleteDBResumes,
  msgDBCount,
  getDBMessageList,
  fetchDBChatMessages,
  getDBUserDetails,
  ResumeDBChecker,
  getDBAdminUser,
  UpdateDBStatus,
  getDBAdminApp,
  deleteDBJobApp,
  EmployerDBApplications,
  getDBJobById,
  UpdateDBReadStatus,
  GetDBJobsforAts,
  UpdateDBJobPost,
  GetDBJobByEmployer,
  deleteDBApp,
  AddDBJobApplication,
  AuthenticateDBUser,
  applicationDBCheck,
  getDBApplications,
  getDBEmployer,
  getDBJobs,
  AppDBCount,
  JobDBCount,
  updateDbUser,
  getDBEmployerById,
  SingleDBJob,
  updateDBPassword,
  updateDBEmployer,
  passwordDBCheck,
  CreateDBJobs,
} = require("./db");

const graphqlSchema = `
scalar ObjectId
scalar GraphQLDate
scalar Upload
scalar JSON

enum usertype{
  user,
  employer,
  admin
}
enum JobApplicationStatus {
  SUBMITTED
  UNDER_REVIEW
  INTERVIEW_SCHEDULED
  INTERVIEWED
  PENDING_DECISION
  OFFER_EXTENDED
  OFFER_ACCEPTED
  OFFER_DECLINED
  NOT_SELECTED
  WITHDRAWN
}

type User {
  _id: ObjectId
  FirstName: String
  LastName: String
  Email: String
  Password: String
  Contact: String
  UserType: usertype
  ProfilePicture: String
  Resume: [String]
}
type Employer {
  _id: ObjectId
  CompanyName: String
  CompanyDescription: String
  Industry: String
  Website: String
  userId: ObjectId
  CompanyLogo: String
}
type CurrentUser {
  userId: ObjectId
  email: String
  fname: String
  lname: String
  userType: String
}
type Job {
  _id: ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  employerId: ObjectId
  datePosted: GraphQLDate
  CompanyName: String
  CompanyLogo: String
}
type SingleJobDetails {
  _id: ObjectId
  userId: ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  employerId: ObjectId
  datePosted: GraphQLDate
  CompanyName: String
  CompanyLogo: String
}
type Application {
  _id: ObjectId
  userId: ObjectId
  jobId: ObjectId
  Status:JobApplicationStatus
  education: String
  experience: String
  skills: String
  availabilities: [String]
  appliedDate : GraphQLDate
  resume : String
}
type EmployerApplications {
  _id:ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  CompanyName: String
  Status:JobApplicationStatus
  education: String
  experience: String
  skills: String
  availabilities: [String]
  appliedDate : GraphQLDate
  FirstName: String
  LastName: String
  Email: String
  Contact: String
  resume: String
  userId: ObjectId
  atsScore: Float
}
type GetJobById {
  _id:ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  CompanyName: String
  Status:JobApplicationStatus
  education: String
  experience: String
  skills: String
  availabilities: [String]
  appliedDate : GraphQLDate
  resume : String
}
type AdminApp {
  _id:ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  CompanyName: String
  education: String
  experience: String
  skills: String
  availabilities: [String]
  appliedDate : GraphQLDate
  resume: String
  FirstName: String
  LastName: String
  CompanyLogo: String
  userId: ObjectId
}
type JobsByEmployer {
  _id: ObjectId
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
  employerId: ObjectId
  datePosted: GraphQLDate
}
type JobsforAts {
  _id: ObjectId
  jobTitle: String
  CompanyName: String
}
type AdminUser {
  _id: ObjectId
  FirstName: String
  LastName: String
  Email: String
  Contact: String
  UserType: usertype
  CompanyName: String
  JobCount: String
  AppCount: String
}
type EmployerProfile {
  _id: ObjectId
  FirstName: String
  LastName: String
  Email: String
  Contact: String
  CompanyName: String
  CompanyDescription: String
  Industry: String
  Website: String
  ProfilePicture: String
  CompanyLogo: String
}
type Message {
  _id: ObjectId!
  senderID: ObjectId!
  receiverID: ObjectId!
  content: String!
  readStatus: Boolean!
  timestamp: GraphQLDate!
}
type Notification {
  _id: ObjectId!
  userId: ObjectId!
  message: String!
  timestamp: GraphQLDate!
  image: String!
  readStatus: Boolean!
}
input UserInputs {
  FirstName: String!
  LastName: String!
  Email: String!
  Password: String!
  Contact: String!
  UserType: usertype!
  ProfilePicture: Upload
  Resume: Upload
}
input ResumeInputs {
  jobDesc: String
  jobPosting: ObjectId
  resume: Upload
}
input UserUpdate {
  FirstName: String
  LastName: String
  Email: String
  Contact: String
  ProfilePicture: Upload
  Resume: [Upload]
}
input EmployerUpdate {
  CompanyName: String
  CompanyDescription: String
  Industry: String
  Website: String
  CompanyLogo: Upload
}
input JobApplication {
  education: String
  experience: String
  skills: String
  availabilities: [String]
  resume: String
}
input JobInputs {
  jobTitle: String
  jobType: String
  jobCategory: String
  jobLocation: String
  jobDescription: String
  salary: String
}
type AuthResult {
  success: Boolean!
  token: String
}
type Query {
  UserList: [User!]!
  UserDetails: User
  Employer: EmployerProfile
  validateEmail(email : String): Boolean!
  validateUpdateEmail(email : String): Boolean!
  getCurrentUser: CurrentUser
  SingleJob(id:ID!): SingleJobDetails!
  JobList: [Job!]!
  getJobById: [GetJobById]
  getAdminApp: [AdminApp]
  getEmployerById: Boolean
  ApplicationsList: [Application!]!
  AppCount: Int
  JobCount: Int
  HomeJobs:[Job]
  GetJobByEmployer:[JobsByEmployer]
  GetJobsforAts:[JobsforAts]
  GetJobByJobId(jobId:ID) : JobsByEmployer
  GetJobByResume(resume:String) : EmployerApplications
  EmployerJobApplications : [EmployerApplications]
  AdminUser : [AdminUser]
  messages: [Message!]!
  notifications: [Notification!]!
  messageList(userType: String!): [EmployerProfile!]!
  fetchChatMessages(senderID: ID!, receiverID: ID!): [Message!]!
  msgCount: Int
}

type Mutation {
  CreateUser(User:UserInputs!): User!
  VerifyResume(resume:Upload!): Boolean!
  ResumeChecker(atsData:ResumeInputs!): JSON
  JobPost(Job:JobInputs!): Job!
  updateUser(User:UserUpdate): User!
  deleteResumes(Resume:[String]): User!
  updateEmployer(Employer:EmployerUpdate): Employer!
  AddJobApplication(App:JobApplication,jobId:ID!): Application!
  AuthenticateUser(email : String, password : String): AuthResult
  fetchToken : Boolean
  passwordCheck(currentPassword:String!): Boolean
  updatePassword(password:String!):Boolean
  applicationCheck(jobId:ID):Boolean
  deleteApp(appId:ID):Boolean
  deleteJobApp(jobId:ID):Boolean
  sendMessage(senderID: ID!, receiverID: ID!, content: String!): Message
  addNotification(userId: ID!, image:String!, message: String!): Notification
  UpdateJobPost(job:ID, data:JobInputs!) : Boolean
  UpdateStatus(appId:ID,status: String) : Boolean
  UpdateReadStatus(senderID: ID!) : Boolean
  UpdateNotificationStatus : Notification
}

type Subscription {
  newMessage: Message
  MessageCount: JSON
  newNotification: Notification
}
`;

const GraphQLDate = new GraphQLScalarType({
  name: "GraphQLDate",
  description: "A Date() type in GraphQL as a scalar",
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    return ast.kind == Kind.STRING ? new Date(ast.value) : undefined;
  },
});
const ObjectId = new GraphQLScalarType({
  name: "ObjectId",
  description: "A MongoDB ObjectID type in GraphQL as a scalar",
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});

// Define resolvers for queries, mutations, and custom scalar types
const resolvers = {
  Query: {
    UserList: getUser,
    UserDetails: getUserDetails,
    Employer: getEmployer,
    JobList: getJob,
    validateEmail,
    validateUpdateEmail,
    fetchChatMessages,
    getJobById,
    GetJobByResume,
    messageList: getMessageList,
    GetJobByJobId,
    GetJobByEmployer,
    AppCount,
    EmployerJobApplications,
    JobCount,
    getEmployerById,
    getAdminApp,
    msgCount,
    messages: getMessages,
    notifications: getNotifications,
    GetJobsforAts,
    ApplicationsList: getApplications,
    AdminUser: getAdminUser,
    SingleJob,
    getCurrentUser: async (_, __, context) => {
      const user = decodeJWTToken(context.token);
      if (user) {
        return user;
      } else {
        return null;
      }
    },
  },
  Mutation: {
    CreateUser,
    AuthenticateUser,
    JobPost,
    updateUser,
    deleteJobApp,
    updateEmployer,
    deleteApp,
    VerifyResume,
    sendMessage,
    UpdateReadStatus,
    addNotification,
    UpdateStatus,
    UpdateJobPost,
    updatePassword,
    AddJobApplication,
    passwordCheck,
    ResumeChecker,
    deleteResumes,
    applicationCheck,
    UpdateNotificationStatus,
    fetchToken: async (_, __, context) => {
      try {
        const user = decodeJWTToken(context.token);
        if (user && user.exp * 1000 < Date.now()) {
          return false;
        } else {
          return true;
        }
      } catch (error) {
        return false;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: async (_, __, context) => {
        // Subscribe to new messages for the specified receiver
        return pubsub.asyncIterator("NEW_MESSAGE_ADDED");
      },
      resolve: (payload) => {
        // Ensure payload.message is not null
        if (payload && payload.message) {
          // Return the content of the message
          return payload.message;
        }
      },
    },
    newNotification: {
      subscribe: async (_, __, context) => {
        // Subscribe to new messages for the specified receiver
        return pubsub.asyncIterator("NEW_NOTIFICATION_ADDED");
      },
      resolve: (payload) => {
        // Ensure payload.message is not null
        if (payload && payload.notification) {
          // Return the content of the message
          return payload.notification;
        }
      },
    },
    MessageCount: {
      subscribe: async (_, __, context) => {
        // Subscribe to new messages for the specified receiver
        return pubsub.asyncIterator("COUNT_UPDATED");
      },
      resolve: (payload) => {
        // Ensure payload.message is not null
        if (payload) {
          // Return the content of the message
          return payload;
        }
      },
    },
  },
  ObjectId,
};

// Fetch all Users
async function getUser(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBUsers();
}

// Fetch msgcount
async function msgCount(_, __, context) {
  const user = decodeJWTToken(context.token);
  const count = await msgDBCount(user.userId);
  return count;
}

// Fetch all messages
async function getMessages(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBMessages();
}

// fetch notification
async function getNotifications(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBNotifications(user.userId);
}

// Update read status
async function UpdateReadStatus(_, { senderID }, context) {
  const user = decodeJWTToken(context.token);
  const status = await UpdateDBReadStatus(senderID, user.userId);
  pubsub.publish("COUNT_UPDATED", { senderID, receiverID: user.userId });
  return status;
}
// Update read status
async function UpdateNotificationStatus(_, __, context) {
  const user = decodeJWTToken(context.token);
  const status = await UpdateDBNotificationStatus(user.userId);
  pubsub.publish("NEW_NOTIFICATION_ADDED", { notification: status });
  return status;
}

// Fetch all users for messages
async function getMessageList(_, { userType }, context) {
  const user = decodeJWTToken(context.token);
  return await getDBMessageList(userType);
}
// Fetch all messages
async function fetchChatMessages(_, { senderID, receiverID }, context) {
  const user = decodeJWTToken(context.token);
  return await fetchDBChatMessages(senderID, receiverID);
}

// send a message
async function sendMessage(_, { senderID, receiverID, content }, context) {
  const user = decodeJWTToken(context.token);
  // Create a new message object
  const message = {
    senderID: senderID,
    receiverID: receiverID,
    content,
    readStatus: false,
    timestamp: new Date(),
  };
  const msg = await sendDBMessage(message);
  pubsub.publish("NEW_MESSAGE_ADDED", { message: msg });
  pubsub.publish("COUNT_UPDATED", { senderID, receiverID });
  return msg;
}
// send a message
async function addNotification(_, { userId, image, message }, context) {
  const user = decodeJWTToken(context.token);
  // Create a new message object
  const notification = {
    userId,
    message,
    image,
    readStatus: false,
    timestamp: new Date(),
  };
  const noti = await addDBNotification(notification);
  pubsub.publish("NEW_NOTIFICATION_ADDED", { notification: noti });
  return noti;
}

async function VerifyResume(_, { resume }) {
  try {
    // Validate input
    if (!resume || !resume.data) {
      throw new Error("Invalid resume data");
    }

    // Decode base64 encoded resume data
    const decodedData = Buffer.from(resume.data, "base64");

    // Process the PDF data to extract text
    const resumeText = await pdf(decodedData).then((data) => data.text);

    // Define common keywords to search for in the resume text
    const commonKeywords = [
      "Skills",
      "Experience",
      "Education",
      "Achievements",
      "Certifications",
      "Certification",
      "Languages",
      "Interests",
      "Objective",
      "Profile",
      "Awards",
      "Award",
      "History",
      "Employment",
      "Activities",
      "Presentation",
      "Activity",
      "Responsibilities",
      "Qualifications",
      "Accomplishments",
      "Training",
      "Projects",
      "Project",
      "Proficiency",
      "Job Title",
      "Job Titles",
      "Availability",
      "Technical Skills",
      "Soft Skills",
      "Contact Information",
      "Summary",
      "Hobbies",
      "Extracurricular Activities",
      "Career Goals",
      "Career Goal",
      "Career",
    ];

    // Function to check if keywords are present in the resume text
    function checkKeywordsInString(inputString) {
      const foundKeywords = [];
      commonKeywords.forEach((keyword) => {
        if (inputString.toLowerCase().includes(keyword.toLowerCase())) {
          foundKeywords.push(keyword);
        }
      });
      return foundKeywords;
    }

    // Check for presence of keywords in the resume text
    const foundKeywords = checkKeywordsInString(resumeText);

    // Return true if at least 4 keywords are found, otherwise return false
    return foundKeywords.length >= 4;
  } catch (error) {
    // Handle any errors that occur during processing
    console.error("Error processing resume:", error);
    throw new Error("An error occurred while processing the resume");
  }
}

function countWords(str) {
  // Remove leading and trailing white spaces and convert to lowercase
  str = str.trim().toLowerCase();
  // Remove punctuation using regular expression
  str = str.replace(/[^\w\s]/g, "");
  // Split the string by spaces
  let words = str.split(/\s+/);
  // Return the number of words
  return words.length;
}

function extractKeywords(array) {
  let keywords = [];
  array.forEach((item) => {
    Object.values(item).forEach((value) => {
      if (typeof value === "string") {
        // Remove punctuation using regular expression
        value = value.replace(/[^\w\s]/g, "");
        keywords.push(...value.split(" "));
      } else if (Array.isArray(value)) {
        value.forEach((val) => {
          if (typeof val === "string") {
            // Remove punctuation using regular expression
            val = val.replace(/[^\w\s]/g, "");
            keywords.push(...val.split(" "));
          }
        });
      }
    });
  });
  return Array.from(new Set(keywords)); // Return unique keywords
}

function extractKeywordsFromArray(array) {
  let keywords = [];
  array.forEach((item) => {
    // Remove punctuation and split the string into words
    const words = item.replace(/[^\w\s]/g, "").split(/\s+/);
    // Add individual words to the keywords array
    keywords.push(...words);
  });
  return Array.from(new Set(keywords)); // Return unique keywords
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
  const percentage = (matchCount / jobKeywordsCount) * 60;
  return percentage;
}

async function ResumeChecker(_, { atsData }) {
  // for resume
  const decodedData = Buffer.from(atsData.resume.data, "base64");
  const resumeText = await pdf(decodedData).then((data) => data.text);

  // Example usage:
  let resumecount = countWords(resumeText);

  let resumeResult = null;
  let attemptCount = 0;
  const maxAttempts = 3; // Maximum number of attempts

  while (!resumeResult && attemptCount < maxAttempts) {
    try {
      const response = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: `${resumeText} classify given resume in this format only, if details does not exists than keep respective value empty and strictly give json format only {
                "location": "",
                "contact": "",
                "email": "",
                "linkedin": "",
                "education": [],
                "work_experience": [],
                "skills": []
            }`,
        max_tokens: 2000,
      });

      resumeResult = await response.choices[0].text;
      attemptCount++;
    } catch (error) {
      console.error("Error:", error);
      attemptCount++;
    }
  }

  if (resumeResult) {
    try {
      const JsonResult = JSON.parse(resumeResult);

      // Combine keywords from education, work_experience, and skills
      const combinedKeywords = [
        ...extractKeywords(JsonResult.education),
        ...extractKeywords(JsonResult.work_experience),
        ...extractKeywordsFromArray(JsonResult.skills),
      ];

      // Remove stopwords from combined keywords
      const cleanedKeywords = stopword.removeStopwords(combinedKeywords);

      // Add combined and cleaned keywords to a new property
      JsonResult.combined_keywords = cleanedKeywords;

      // Remove education, work_experience, and skills properties
      delete JsonResult.education;
      delete JsonResult.work_experience;
      delete JsonResult.skills;
      console.log(JsonResult);
      JsonResult.word_count = resumecount;
      const JsonResultPercent = {};
      JsonResultPercent.location = JsonResult.location !== "";
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Regular expression for contact number format validation
      var canadianContactRegex =
        /^(\+?1\s?-?)?(\()?\d{3}(\))?[-\s]?\d{3}[-\s]?\d{4}$/;

      // Check if the contact number and email fields are not empty and have correct format
      JsonResultPercent.contact =
        JsonResult.contact !== "" &&
        canadianContactRegex.test(JsonResult.contact);
      JsonResultPercent.email =
        JsonResult.email !== "" && emailRegex.test(JsonResult.email);
      JsonResultPercent.linkedin = JsonResult.linkedin !== "";
      JsonResultPercent.word_count = JsonResult.word_count !== "";
      if (JsonResult.word_count < 50 || JsonResult.word_count > 1000) {
        JsonResultPercent.word_count = 1;
      } else if (
        (JsonResult.word_count >= 50 && JsonResult.word_count < 100) ||
        (JsonResult.word_count >= 900 && JsonResult.word_count < 1000)
      ) {
        JsonResultPercent.word_count = 2;
      } else if (
        (JsonResult.word_count >= 100 && JsonResult.word_count < 150) ||
        (JsonResult.word_count >= 850 && JsonResult.word_count < 900)
      ) {
        JsonResultPercent.word_count = 3;
      } else if (
        (JsonResult.word_count >= 150 && JsonResult.word_count < 200) ||
        (JsonResult.word_count >= 800 && JsonResult.word_count < 850)
      ) {
        JsonResultPercent.word_count = 4;
      } else if (
        (JsonResult.word_count >= 200 && JsonResult.word_count < 250) ||
        (JsonResult.word_count >= 750 && JsonResult.word_count < 800)
      ) {
        JsonResultPercent.word_count = 5;
      } else if (
        (JsonResult.word_count >= 250 && JsonResult.word_count < 300) ||
        (JsonResult.word_count >= 700 && JsonResult.word_count < 750)
      ) {
        JsonResultPercent.word_count = 6;
      } else if (
        (JsonResult.word_count >= 300 && JsonResult.word_count < 350) ||
        (JsonResult.word_count >= 650 && JsonResult.word_count < 700)
      ) {
        JsonResultPercent.word_count = 7;
      } else if (
        (JsonResult.word_count >= 350 && JsonResult.word_count < 400) ||
        (JsonResult.word_count >= 600 && JsonResult.word_count < 650)
      ) {
        JsonResultPercent.word_count = 8;
      } else if (
        (JsonResult.word_count >= 400 && JsonResult.word_count < 450) ||
        (JsonResult.word_count >= 550 && JsonResult.word_count < 600)
      ) {
        JsonResultPercent.word_count = 9;
      } else if (
        (JsonResult.word_count >= 450 && JsonResult.word_count <= 500) ||
        (JsonResult.word_count >= 500 && JsonResult.word_count < 550)
      ) {
        JsonResultPercent.word_count = 10;
      }

      // for job Posting
      if (atsData.jobPosting) {
        const jobPosting = await ResumeDBChecker(atsData.jobPosting);
        const matchPercentage = calculateKeywordMatchPercentage(
          jobPosting.jobKeywords,
          JsonResult.combined_keywords
        );

        JsonResultPercent.score =
          matchPercentage +
          JsonResultPercent.word_count +
          (JsonResultPercent.location ? 5 : 0) +
          (JsonResultPercent.contact ? 10 : 0) +
          (JsonResultPercent.email ? 10 : 0) +
          (JsonResultPercent.linkedin ? 5 : 0);
        JsonResultPercent.combinedKeywords = (matchPercentage / 60) * 100;
        JsonResultPercent.word_count = JsonResultPercent.word_count * 10;
        console.log(JsonResultPercent);
      }

      // for job Desc
      if (atsData.jobDesc) {
        let jobKeywords = [];
        try {
          while (jobKeywords.length === 0) {
            const response = await openai.completions.create({
              model: "gpt-3.5-turbo-instruct",
              prompt: `${atsData.jobDesc} according to the content generate keywords for ats in this separated by comma`,
              max_tokens: 2000,
            });

            jobKeywords = await response.choices[0].text;
            jobKeywords = jobKeywords
              .split(",")
              .map((keyword) => keyword.replace(/\./g, "").trim());
            console.log(jobKeywords);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } catch (error) {
          throw new UserInputError("Error generating Keywords", { error });
        }
        function removeHtmlTagsAndPunctuation(html) {
          const cleanText = html
            .replace(/<[^>]*>/g, " ") // Replace HTML tags with space
            .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
            .replace(/[^\w\s]/g, " ") // Replace punctuation with space
            .replace(/\s+/g, " ") // Replace multiple spaces with single space
            .trim(); // Trim leading and trailing spaces

          // Split the clean text into words, filter out repeated words, and join them back
          const uniqueWords = cleanText
            .split(" ")
            .filter((word, index, self) => {
              return self.indexOf(word) === index;
            });
          return uniqueWords.join(" ");
        }

        function extractKeywordsforJobDesc(text) {
          return text.split(/\s+/).filter((word) => word.length > 0);
        }
        const combinedjobs = jobKeywords.join(" ");
        const appKeyword = stopword.removeStopwords(
          extractKeywordsforJobDesc(removeHtmlTagsAndPunctuation(combinedjobs))
        );
        const matchPercentage = calculateKeywordMatchPercentage(
          appKeyword,
          JsonResult.combined_keywords
        );
        JsonResultPercent.score =
          matchPercentage +
          JsonResultPercent.word_count +
          (JsonResultPercent.location ? 5 : 0) +
          (JsonResultPercent.contact ? 10 : 0) +
          (JsonResultPercent.email ? 10 : 0) +
          (JsonResultPercent.linkedin ? 5 : 0);
        JsonResultPercent.combinedKeywords = (matchPercentage / 60) * 100;
        JsonResultPercent.word_count = JsonResultPercent.word_count * 10;
        console.log(JsonResultPercent);
      }
      return JsonResultPercent;
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  } else {
    console.error(
      "Maximum attempts reached without receiving valid JSON response."
    );
  }
}

// Fetch all Users for admin
async function getAdminUser(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBAdminUser();
}

async function AppCount() {
  return await AppDBCount();
}
async function UpdateStatus(_, { appId, status }, context) {
  const user = decodeJWTToken(context.token);
  return await UpdateDBStatus(appId, status);
}
async function getAdminApp(_, {}, context) {
  const user = decodeJWTToken(context.token);
  return await getDBAdminApp();
}
async function GetJobByJobId(_, { jobId }, context) {
  const user = decodeJWTToken(context.token);
  if (user) {
    return await GetDBJobByJobId(jobId);
  }
}
async function deleteJobApp(_, { jobId }, context) {
  const user = decodeJWTToken(context.token);
  if (user) {
    return await deleteDBJobApp(jobId);
  }
}
async function GetJobByEmployer(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await GetDBJobByEmployer(user.userId);
}
async function JobCount() {
  return await JobDBCount();
}
async function EmployerJobApplications(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await EmployerDBApplications(user.userId);
}
// Fetch all User details
async function getUserDetails(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBUserDetails(user.userId);
}
// Fetch all applications
async function getApplications(_, __, context) {
  const user = decodeJWTToken(context.token);
  if (user) {
    return await getDBApplications();
  }
}
// Fetch all applications
async function getEmployerById(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBEmployerById(user.userId);
}
// Add Job Applications
async function AddJobApplication(_, { App, jobId }, context) {
  const user = decodeJWTToken(context.token);
  App.Status = "SUBMITTED";
  App.appliedDate = new Date();
  console.log(user.userId);
  console.log(App);
  return await AddDBJobApplication(App, jobId, user.userId);
}
// Add Job Applications
async function deleteApp(_, { appId }, context) {
  const user = decodeJWTToken(context.token);
  if (user) {
    return await deleteDBApp(appId);
  }
}
// Fetch single job
async function SingleJob(_, { id }) {
  return await SingleDBJob(id);
}
// Fetch single job
async function UpdateJobPost(_, { job, data }, context) {
  const user = decodeJWTToken(context.token);
  return await UpdateDBJobPost(job, data);
}
// Fetch all Jobs
async function getJob() {
  return await getDBJobs();
}
// Fetch all Jobs by id
async function getJobById(_, __, context) {
  const user = decodeJWTToken(context.token);
  return await getDBJobById(user.userId);
}
// Fetch all Jobs by id
async function GetJobByResume(_, {resume}, context) {
  const user = decodeJWTToken(context.token);
  return await GetDBJobByResume(resume);
}
// checks application
async function applicationCheck(_, { jobId }, context) {
  const user = decodeJWTToken(context.token);
  return await applicationDBCheck(user.userId, jobId);
}
// Check Password
async function passwordCheck(_, { currentPassword }, context) {
  const employer = decodeJWTToken(context.token);
  return await passwordDBCheck(employer.userId, currentPassword);
}
// Fetch all Jobs
async function getEmployer(_, __, context) {
  const employer = decodeJWTToken(context.token);
  return await getDBEmployer(employer.userId);
}
// Update
async function updatePassword(_, { password }, context) {
  const user = decodeJWTToken(context.token);
  return await updateDBPassword(user.userId, password);
}
// Update
async function GetJobsforAts(_, __, context) {
  return await GetDBJobsforAts();
}
// Check email if already exists
async function validateEmail(_, { email }) {
  const emailExists = await validateDBEmail(email);
  return !emailExists;
}
// Check email if already exists
async function validateUpdateEmail(_, { email }, context) {
  const employer = decodeJWTToken(context.token);
  const emailExists = await validateDBUpdateEmail(email,employer.userId);
  return !emailExists;
}
// Validation for User
function validateUser(user) {
  const errors = [];

  // Validate Email
  if (!user.Email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.Email)) {
    errors.push("Please enter a valid email address");
  }

  // Validate Contact
  if (!user.Contact || !/^\d+$/.test(user.Contact)) {
    errors.push("Please enter a valid contact number");
  }

  if (errors.length > 0) {
    throw new UserInputError("Invalid input(s)", { errors });
  }
}
function validateJob(job) {
  const errors = [];

  // Validate Job Title
  if (!job.jobTitle || job.jobTitle.trim() === "") {
    errors.push("Job Title is required");
  }

  // Validate Job Type
  if (!job.jobType) {
    errors.push("Job Type is required");
  }

  // Validate Job Category
  if (!job.jobCategory) {
    errors.push("Job Category is required");
  }

  // Validate Job Location
  if (!job.jobLocation || job.jobLocation.trim() === "") {
    errors.push("Job Location is required");
  }

  // Validate Salary
  if (
    !job.salary ||
    job.salary.trim() === "" ||
    isNaN(job.salary) ||
    +job.salary < 0
  ) {
    errors.push("Invalid salary amount");
  }

  // Validate Job Description
  if (!job.jobDescription || job.jobDescription.trim() === "") {
    errors.push("Job Description is required");
  }

  if (errors.length > 0) {
    throw new UserInputError("Invalid input(s)", { errors });
  }
}

// Creates a user
async function CreateUser(_, { User }) {
  if (User.ProfilePicture.data) {
    const decodedData = Buffer.from(User.ProfilePicture.data, "base64");

    // Get the original filename
    const originalFilename = User.ProfilePicture.name;

    // Generate a unique filename based on the original filename
    const { name, ext } = path.parse(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${name}_${timestamp}_${randomString}${ext}`;
    const filePath = `./public/profile/${uniqueFileName}`;

    try {
      fs.writeFileSync(filePath, decodedData);
      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
    // Update the User object with the unique filename
    User.ProfilePicture = uniqueFileName;
  }
  if (User.Resume.data) {
    const decodedData = Buffer.from(User.Resume.data, "base64");

    // Get the original filename
    const originalFilename = User.Resume.name;

    // Generate a unique filename based on the original filename
    const { name, ext } = path.parse(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${name}_${timestamp}_${randomString}${ext}`;
    const filePath = `./public/resume/${uniqueFileName}`;

    try {
      fs.writeFileSync(filePath, decodedData);
      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
    // Update the User object with the unique filename
    User.Resume = uniqueFileName;
  }

  validateUser(User);

  // Hash the password
  let hashedPassword = await bcrypt.hash(User.Password, 12);
  User.Password = hashedPassword;
  return await CreateDBUsers(User);
}
// update an user
async function updateUser(_, { User }, context) {
  const user = decodeJWTToken(context.token);
  if (User.ProfilePicture) {
    const decodedData = Buffer.from(User.ProfilePicture.data, "base64");

    // Get the original filename
    const originalFilename = User.ProfilePicture.name;

    // Generate a unique filename based on the original filename
    const { name, ext } = path.parse(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${name}_${timestamp}_${randomString}${ext}`;
    const filePath = `./public/profile/${uniqueFileName}`;

    try {
      fs.writeFileSync(filePath, decodedData);
      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
    // Update the User object with the unique filename
    User.ProfilePicture = uniqueFileName;
  }
  if (User.Resume && Array.isArray(User.Resume)) {
    User.Resume.forEach((resumeFile, index) => {
      const decodedData = Buffer.from(resumeFile.data, "base64");

      // Generate a unique filename based on the original filename
      const { name, ext } = path.parse(resumeFile.name);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const uniqueFileName = `${name}_${timestamp}_${randomString}${ext}`;
      const filePath = `./public/resume/${uniqueFileName}`;

      try {
        fs.writeFileSync(filePath, decodedData);
        console.log(`File ${index + 1} saved successfully!`);
      } catch (error) {
        console.error(`Error saving file ${index + 1}:`, error);
      }

      // Update the User object with the unique filename and remove name and data properties
      User.Resume[index] = uniqueFileName;
    });
  }

  return await updateDbUser(user.userId, User);
}
// update an user
async function deleteResumes(_, { Resume }, context) {
  const user = decodeJWTToken(context.token);

  return await deleteDBResumes(user.userId, Resume);
}
// update an user
async function updateEmployer(_, { Employer }, context) {
  const user = decodeJWTToken(context.token);
  console.log(Employer);
  if (Employer.CompanyLogo) {
    const decodedData = Buffer.from(Employer.CompanyLogo.data, "base64");

    // Get the original filename
    const originalFilename = Employer.CompanyLogo.name;

    // Generate a unique filename based on the original filename
    const { name, ext } = path.parse(originalFilename);
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${name}_${timestamp}_${randomString}${ext}`;
    const filePath = `./public/logo/${uniqueFileName}`;

    try {
      fs.writeFileSync(filePath, decodedData);
      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
    // Update the User object with the unique filename
    Employer.CompanyLogo = uniqueFileName;
  }
  Employer.userId = user.userId;
  console.log(Employer);
  return await updateDBEmployer(user.userId, Employer);
}
// Creates a Job
async function JobPost(_, { Job }, context) {
  const employer = decodeJWTToken(context.token);
  console.log(employer);
  validateJob(Job);
  const id = employer.userId;
  Job.datePosted = new Date();
  try {
    let jobKeywords = [];

    while (jobKeywords.length === 0) {
      const response = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: `Job title: ${Job.jobTitle},jobCategory: ${Job.jobCategory},jobLocation: ${Job.jobLocation}, Job Description: ${Job.jobDescription} according to the content generate keywords for ats in this separated by comma`,
        max_tokens: 2000,
      });

      jobKeywords = await response.choices[0].text;
      jobKeywords = jobKeywords
        .split(",")
        .map((keyword) => keyword.replace(/\./g, "").trim());
      console.log(jobKeywords);
      Job.jobKeywords = jobKeywords;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    throw new UserInputError("Error generating Keywords", { error });
  }
  return await CreateDBJobs(Job, id);
}
async function AuthenticateUser(_, { email, password }) {
  try {
    return await AuthenticateDBUser(email, password);
  } catch (error) {
    throw new UserInputError("Authentication failed", { error });
  }
}

// Export resolvers and schema for use in Apollo Server
module.exports = { resolvers, graphqlSchema };
