import { ROLES } from "@/enum";
import { AuthorModel, UserModel } from "@/model";
import { asyncHandler } from "@/utils";
import { faker } from "@faker-js/faker";
import { getRandomNumber } from "./helper";
import { appEnv } from "@/config";

const seedAuthorData = asyncHandler(async (_req, res) => {
  if (appEnv.NODE_ENV !== "development") {
    throw new Error("Seeding only allowed in development environment");
  }
  const AuthorRecords = await UserModel.find({ role: ROLES.AUTHOR }).select("_id");

  if (AuthorRecords.length === 0) {
    throw new Error("No author records found. Please seed user data first.");
  }

  const AuthorIds: string[] = AuthorRecords.map((author) => author._id.toHexString());
  const authorData = AuthorIds.map(function (authorId) {
    const name = faker.person.fullName();
    return {
      userId: authorId,
      name: name,
      about: faker.lorem.paragraph(),
      slug: faker.helpers.slugify(`${name}${authorId}`),
      socialLinks: new Array(getRandomNumber(5)).fill("_").map(() => faker.internet.url()),
      books: [],
    };
  });

  await Promise.all(
    authorData.map(async (author) => {
      await AuthorModel.create(author);
    })
  );
  console.log("Author data seeding completed successfully.");
  res.status(201).json({ message: "Author data seeding completed successfully." });
});
export default seedAuthorData;
