# Backend Development Guidelines for E-Book Store API

This document outlines essential coding standards and best practices for our Node.js, Express, and TypeScript backend development. Following these guidelines will ensure high-quality, maintainable, and secure code.

## Core Principles

- **Type Safety**: Leverage TypeScript's type system to prevent runtime errors
- **Clean Architecture**: Maintain separation of concerns (controllers, services, models)
- **Security-First**: Protect against common vulnerabilities and follow OWASP guidelines
- **Performance**: Optimize database queries and API response times
- **Error Handling**: Implement comprehensive error handling with proper logging
- **Maintainability**: Write clean, self-documenting code with consistent patterns


## Key Principles

- Maximum type safety
- Clean, maintainable code
- Security-first approach
- Performance optimization
- Error handling excellence

## Before Writing Code

1. Analyze existing patterns in the codebase
2. Consider edge cases and error scenarios
3. Follow the rules below strictly
4. Implement proper error handling
5. Ensure security best practices
6. Write comprehensive tests

## Development Workflow

1. **Before Coding**:
   - Analyze requirements and plan your approach
   - Review existing patterns in the codebase
   - Consider edge cases and error scenarios
   - Plan your data model and API design

2. **During Development**:
   - Write clean, self-documenting code
   - Implement proper validation and error handling
   - Adhere to the project's architectural patterns
   - Follow security best practices

3. **After Development**:
   - Test thoroughly (unit, integration, edge cases)
   - Document your code and API endpoints
   - Review your code for security vulnerabilities
   - Optimize for performance if needed

## TypeScript Best Practices

- Use strict TypeScript configuration (`"strict": true` in tsconfig.json)
- Create interfaces for all data models and API request/response objects
- Use type guards to handle dynamic or unknown data safely
- Avoid using `any` type - use `unknown` with type guards when necessary
- Use `readonly` for properties that shouldn't be modified
- Use `interface` for object types and `type` for unions, intersections, and tuples
- Use `Record<K, V>` for dynamic key-value objects
- Don't use TypeScript enums - use union types or `as const` objects instead
- Use `export type` and `import type` for type imports
- Don't use non-null assertions (`!`) - handle null/undefined explicitly
- Use consistent array notation - either `T[]` or `Array<T>`, prefer `T[]` for simple types
- Use branded types for IDs and other primitive values that need type safety

## Express & API Best Practices

- Structure routes using Express Router with consistent patterns
- Implement middleware for common functionality (auth, validation, etc.)
- Use async/await with proper error handling
- Implement request validation using Zod, Joi, or class-validator
- Follow RESTful API design principles:
  - Use appropriate HTTP methods (GET, POST, PUT, DELETE)
  - Use consistent URL patterns (plural nouns for resources)
  - Return appropriate status codes
  - Use query parameters for filtering/pagination
- Implement consistent response format:
  ```ts
  {
    success: boolean;
    message: string;
    data?: any;
    error?: { code: string; details?: any };
  }
  ```
- Implement pagination for list endpoints
- Use proper error middleware to handle exceptions
- Document API endpoints with OpenAPI/Swagger
- Implement request rate limiting
- Use CORS with appropriate origin configuration

## Security Best Practices

- Store sensitive information in environment variables, never in code
- Implement proper authentication and authorization
- Use secure password hashing (bcrypt/argon2)
- Set secure HTTP headers with helmet.js
- Validate and sanitize all user inputs
- Implement proper CORS configuration
- Use parameterized queries to prevent injection attacks
- Implement rate limiting for authentication endpoints
- Set secure cookie options (httpOnly, secure, sameSite)
- Log security events (login attempts, permission changes)
- Implement proper file upload validation and limits
- Rotate API keys and tokens regularly
- Implement proper CSRF protection
- Keep dependencies updated to avoid vulnerabilities

## Database Best Practices

- Use Mongoose schemas with proper validation
- Implement indexes for frequently queried fields
- Use transactions for multi-step operations
- Handle database connection errors gracefully
- Implement soft deletes where appropriate
- Use lean queries when possible for better performance
- Avoid deep population chains, use multiple queries instead
- Use aggregation pipeline for complex data transformation
- Implement proper error handling for database operations
- Use connection pooling
- Avoid large batch operations that could lock collections
- Implement proper database migrations for schema changes
- Use atomic operations when possible
- Implement proper backup and recovery strategies

## Error Handling Patterns

```typescript
// Controller with proper error handling
const getBook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid book ID format');
  }

  // Get book from database
  const book = await bookService.findById(id);
  if (!book) {
    throw new ApiError(404, 'Book not found');
  }

  // Return success response
  res.status(200).json({
    success: true,
    message: 'Book retrieved successfully',
    data: book
  });
});

// Global error handler middleware
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });

  // Handle specific error types
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.details ? { details: err.details } : undefined
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: {
        code: 'VALIDATION_ERROR',
        details: formatMongooseError(err)
      }
    });
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: { code: 'INTERNAL_ERROR' }
  });
};
```

## Service Layer Pattern

```typescript
// Book service with proper separation of concerns
class BookService {
  async findById(id: string): Promise<IBook | null> {
    try {
      return await Book.findById(id).lean();
    } catch (error) {
      logger.error('Error finding book by ID', { id, error });
      throw new DatabaseError('Failed to fetch book', error);
    }
  }

  async create(bookData: CreateBookDto): Promise<IBook> {
    try {
      // Validate author exists
      const authorExists = await Author.exists({ _id: bookData.authorId });
      if (!authorExists) {
        throw new ApiError(400, 'Author does not exist');
      }

      // Create new book
      const book = new Book(bookData);
      await book.save();
      return book;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error creating book', { data: bookData, error });
      throw new DatabaseError('Failed to create book', error);
    }
  }

  async update(id: string, updateData: UpdateBookDto): Promise<IBook | null> {
    try {
      const book = await Book.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return book;
    } catch (error) {
      logger.error('Error updating book', { id, data: updateData, error });
      throw new DatabaseError('Failed to update book', error);
    }
  }
}

export const bookService = new BookService();
```

## Validation Pattern

```typescript
// Request validation with Zod
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Schema definition
const createBookSchema = z.object({
  title: z.string().min(1).max(200),
  authorId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  description: z.string().optional(),
  price: z.number().positive(),
  coverImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  publishDate: z.string().datetime().optional(),
  isbn: z.string().optional()
});

// Validation middleware
export const validateBookCreate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createBookSchema.parse(req.body);
    req.body = validatedData; // Replace with validated data
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        }
      });
      return;
    }
    next(error);
  }
};
```


## Database Transaction Pattern

```typescript
// Mongoose transaction example
async function purchaseBook(userId: string, bookId: string): Promise<void> {
  // Start session
  const session = await mongoose.startSession();

  try {
    // Start transaction
    session.startTransaction();

    // Find book and check if it exists
    const book = await Book.findById(bookId).session(session);
    if (!book) {
      throw new ApiError(404, 'Book not found');
    }

    // Find user and check if they have enough funds
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.balance < book.price) {
      throw new ApiError(400, 'Insufficient funds');
    }

    // Update user balance
    await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: -book.price } },
      { session }
    );

    // Add book to user's library
    await UserLibrary.create([{
      userId,
      bookId,
      purchaseDate: new Date()
    }], { session });

    // Commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End session
    session.endSession();
  }
}
```

## Testing Best Practices

- Write unit tests for all services and utility functions
- Write integration tests for API endpoints
- Test happy paths, edge cases, and error scenarios
- Use a testing framework like Jest or Mocha
- Use test doubles (mocks, stubs) for external dependencies
- Keep tests independent and isolated
- Use a separate test database
- Clean up test data after each test


## Common Tasks
- `npx ultracite init` - Initialize Ultracite in your project
- `npx ultracite fix` - Format and fix code automatically
- `npx ultracite check` - Check for issues without fixing


