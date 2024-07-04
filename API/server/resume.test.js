const { execute, parse } = require("graphql");
const fs = require("fs").promises; // Using promises version of fs
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { resolvers, graphqlSchema } = require("./schema");

// Function to convert a file to base64
async function convertFileToBase64(filePath) {
  try {
    const data = await fs.readFile(filePath);
    const base64String = Buffer.from(data).toString("base64");
    return base64String;
  } catch (error) {
    throw new Error(`Error reading file: ${error.message}`);
  }
}

// Define GraphQL mutation documents
const mutationVerifyResume = `
  mutation VerifyResume($resume: Upload!) {
    VerifyResume(resume: $resume)
  }
`;

const mutationResumeChecker = `
  mutation Mutation($atsData: ResumeInputs!) {
    ResumeChecker(atsData: $atsData)
  }
`;

// Mocked data
const resumeFilePath = "./public/resume/testResume.pdf";

// Creating a function to asynchronously set the atsData
async function createMockData() {
  return {
    resume: {
      name: "testResume.pdf",
      data: await convertFileToBase64(resumeFilePath)
    },
    jobDesc: "mockedJobDescription"
  };
}

// Create a schema with the resolvers
const schema = makeExecutableSchema({
  typeDefs: graphqlSchema,
  resolvers
});

describe("Resolver functions", () => {
  it("should return true when verifying a resume", async () => {
    const resume = { data: await convertFileToBase64(resumeFilePath) };
    const context = { token: "mockedToken" };
    const document = parse(mutationVerifyResume);
    const { data, errors } = await execute({
      schema,
      document,
      contextValue: context,
      variableValues: { resume }
    });

    // Assert
    expect(errors).toBeUndefined();
    expect(data.VerifyResume).toBe(true);
  });

  it(
    "should return the correct result when checking resume",
    async () => {
      const atsData = await createMockData();
      const context = { token: "mockedToken" };
      const document = parse(mutationResumeChecker);
      const { data, errors } = await execute({
        schema,
        document,
        contextValue: context,
        variableValues: { atsData }
      });

      // Assert
      expect(errors).toBeUndefined();
      expect(data.ResumeChecker).toEqual(
        expect.objectContaining({
          location: expect.any(Boolean),
          contact: expect.any(Boolean),
          email: expect.any(Boolean),
          linkedin: expect.any(Boolean),
          word_count: expect.any(Number),
          score: expect.any(Number),
          combinedKeywords: expect.any(Number)
        })
      );
    },
    10000 // Set timeout to 10 seconds
  );
});
