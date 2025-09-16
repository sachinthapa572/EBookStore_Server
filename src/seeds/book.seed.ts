import { appEnv } from "@/config";
import { ROLES } from "@/enum";
import { UserModel } from "@/model";
import { asyncHandler } from "@/utils";
import { faker } from "@faker-js/faker";

const bookseed = asyncHandler(async (_req, res) => {
  if (appEnv.NODE_ENV !== "development") {
    throw new Error("Seeding only allowed in development environment");
  }
  const AuthorRecords = await UserModel.find({ role: ROLES.AUTHOR }).select("_id");

  if (AuthorRecords.length === 0) {
    throw new Error("No author records found. Please seed user data first.");
  }

  const AuthorIds: string[] = AuthorRecords.map((author) => author._id.toHexString());
  const bookData = AuthorIds.map((authorId) => {
    return {
      author: authorId,
      title: faker.book.title(),
      slug: faker.helpers.slugify(faker.lorem.words(3)),
      description: faker.lorem.paragraph(),
      language: faker.location.language(),
      publicationName: faker.book.publisher(),
      genre: faker.book.genre(),
      publishedAt: faker.date.past().toISOString(),
      price: {
        mrp: faker.commerce.price({ min: 501, max: 1000 }),
        sale: faker.commerce.price({ min: 50, max: 500 }),
      },
      cover: {
        url: faker.image.url(),
        id: "",
      },
      fileInfo: {
        id: faker.datatype.uuid(),
        size: `${faker.datatype.number({ min: 1, max: 100 })}MB`,
      },
    };
  });

  await Promise.all(
    bookData.map(async (book) => {
      await BookModel.create(book);
    })
  );

  console.log("Book data seeding completed successfully.");
  res.status(201).json({ message: "Book data seeding completed successfully." });
});
export default bookseed;
