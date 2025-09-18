#!/usr/bin/env node
"use strict";

import { promises as fs } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function toPascalCase(str) {
  return str.replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase());
}

function toCamelCase(str) {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

// Regex patterns at top level for performance
const MODULE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function createFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content);
    console.log(`📄 Created file: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating file ${filePath}:`, error.message);
  }
}

function getControllerTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);
  const camelName = toCamelCase(moduleName);

  return `import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { ${camelName}Service } from "@/services/${moduleName}/${moduleName}.service";
import type { UuidGType } from "@/validators";
import type { New${pascalName}Type } from "@/validators/${moduleName}/${moduleName}.validation";

// Create ${moduleName}
const create${pascalName}: CustomRequestHandler<New${pascalName}Type> = asyncHandler(
  async (req, res) => {
    const { body, user } = req;

    const ${camelName} = await ${camelName}Service.create${pascalName}(body, user._id);

    res
      .status(HttpStatusCode.CREATED)
      .json(
        new ApiResponse(HttpStatusCode.CREATED, ${camelName}, "${pascalName} has been successfully created")
      );
  }
);

// Get ${moduleName} by ID
const get${pascalName}: CustomRequestHandler<object, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const ${camelName} = await ${camelName}Service.get${pascalName}ById(id);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, ${camelName}, "${pascalName} retrieved successfully"));
  }
);

// Update ${moduleName}
const update${pascalName}: CustomRequestHandler<Partial<New${pascalName}Type>, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    const ${camelName} = await ${camelName}Service.update${pascalName}(id, body);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, ${camelName}, "${pascalName} has been successfully updated"));
  }
);

// Delete ${moduleName}
const delete${pascalName}: CustomRequestHandler<object, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    await ${camelName}Service.delete${pascalName}(id);

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(
          HttpStatusCode.OK,
          { id },
          "${pascalName} has been successfully deleted"
        )
      );
  }
);

export { create${pascalName}, get${pascalName}, update${pascalName}, delete${pascalName} };
`;
}

function getServiceTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);
  const camelName = toCamelCase(moduleName);

  return `import type { ObjectId } from "mongoose";

import { ApiError } from "@/utils/ApiError";
import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";

import type { ${pascalName}Data, New${pascalName}Data } from "./${moduleName}.type";
import { ${pascalName}Model } from "@/model/${moduleName}/${moduleName}.model";
import type { New${pascalName}Type } from "@/validators/${moduleName}/${moduleName}.validation";

class ${pascalName}Service {
  // Create a new ${moduleName}
  async create${pascalName}(${camelName}Data: New${pascalName}Type, userId: ObjectId): Promise<${pascalName}Data> {
    const ${camelName} = await ${pascalName}Model.create({
      ...${camelName}Data,
      user: userId,
    });

    if (!${camelName}) {
      throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Unable to create ${moduleName}");
    }

    logger.info(\`${pascalName} successfully created with ID: \${${camelName}._id}\`);

    return {
      id: ${camelName}._id.toString(),
      ...${camelName}Data,
      createdAt: ${camelName}.createdAt,
      updatedAt: ${camelName}.updatedAt,
    };
  }

  // Get ${moduleName} by ID
  async get${pascalName}ById(${camelName}Id: string): Promise<${pascalName}Data> {
    const ${camelName} = await ${pascalName}Model.findById(${camelName}Id).exec();

    if (!${camelName}) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "${pascalName} not found");
    }

    return {
      id: ${camelName}._id.toString(),
      // Add other fields as needed
      createdAt: ${camelName}.createdAt,
      updatedAt: ${camelName}.updatedAt,
    };
  }

  // Update ${moduleName}
  async update${pascalName}(${camelName}Id: string, updateData: Partial<New${pascalName}Type>): Promise<${pascalName}Data> {
    const ${camelName} = await ${pascalName}Model.findByIdAndUpdate(
      ${camelName}Id,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    if (!${camelName}) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "${pascalName} not found");
    }

    logger.info(\`${pascalName} successfully updated with ID: \${${camelName}._id}\`);

    return {
      id: ${camelName}._id.toString(),
      // Add other fields as needed
      createdAt: ${camelName}.createdAt,
      updatedAt: ${camelName}.updatedAt,
    };
  }

  // Delete ${moduleName}
  async delete${pascalName}(${camelName}Id: string): Promise<void> {
    const ${camelName} = await ${pascalName}Model.findByIdAndDelete(${camelName}Id).exec();

    if (!${camelName}) {
      throw new ApiError(HttpStatusCode.NOT_FOUND, "${pascalName} not found");
    }

    logger.info(\`${pascalName} successfully deleted with ID: \${${camelName}Id}\`);
  }
}

export const ${camelName}Service = new ${pascalName}Service();
`;
}

function getServiceTypeTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);

  return `import type { ObjectId } from "mongoose";

export type ${pascalName}Data = {
  id: string;
  // Add your ${moduleName} properties here
  createdAt: Date;
  updatedAt: Date;
};

export type New${pascalName}Data = {
  // Add properties for creating new ${moduleName}
  user?: ObjectId;
};
`;
}

function getModelTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);

  return `import { type Model, model, type ObjectId, Schema } from "mongoose";

export type ${pascalName}Doc = {
  user: ObjectId;
  // Add your ${moduleName} fields here
  createdAt: Date;
  updatedAt: Date;
};

const ${toCamelCase(moduleName)}Schema = new Schema<${pascalName}Doc>(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    // Add your ${moduleName} schema fields here
  },
  { timestamps: true }
);

export const ${pascalName}Model = model<${pascalName}Doc>("${pascalName}", ${toCamelCase(moduleName)}Schema) as Model<${pascalName}Doc>;
`;
}

function getValidationTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);

  return `import { z } from "zod";

export const new${pascalName}Schema = z.object({
  // Add your validation schema here
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Invalid name type",
    })
    .min(1, "Name cannot be empty"),
});

export const update${pascalName}Schema = new${pascalName}Schema.partial();

export type New${pascalName}Type = z.infer<typeof new${pascalName}Schema>;
export type Update${pascalName}Type = z.infer<typeof update${pascalName}Schema>;
`;
}

function getRouteTemplate(moduleName) {
  const pascalName = toPascalCase(moduleName);
  const camelName = toCamelCase(moduleName);

  return `import { Router } from "express";

import {
  create${pascalName},
  get${pascalName},
  update${pascalName},
  delete${pascalName},
} from "@/controllers/${moduleName}/${moduleName}.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import {
  paramValidator,
  validator,
} from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { new${pascalName}Schema, update${pascalName}Schema } from "@/validators/${moduleName}/${moduleName}.validation";

const ${camelName}Route = Router();

// Public routes (if any)

// Authenticated routes
${camelName}Route.use(isAuth);

${camelName}Route.post(
  "/",
  validator(new${pascalName}Schema),
  create${pascalName}
);

${camelName}Route.get(
  "/:id",
  paramValidator(uuidGSchema("id")),
  get${pascalName}
);

${camelName}Route.put(
  "/:id",
  paramValidator(uuidGSchema("id")),
  validator(update${pascalName}Schema),
  update${pascalName}
);

${camelName}Route.delete(
  "/:id",
  paramValidator(uuidGSchema("id")),
  delete${pascalName}
);

export default ${camelName}Route;
`;
}

async function generateModule(moduleName) {
  const basePath = join(process.cwd(), "../src");
  const pascalName = toPascalCase(moduleName);

  try {
    // Create directories
    const directories = [
      join(basePath, "controllers", moduleName),
      join(basePath, "services", moduleName),
      join(basePath, "model", moduleName),
      join(basePath, "validators", moduleName),
      join(basePath, "routes", pascalName),
    ];

    for (const dir of directories) {
      await createDirectory(dir);
    }

    // Create files
    const files = [
      {
        path: join(basePath, "controllers", moduleName, `${moduleName}.controller.ts`),
        content: getControllerTemplate(moduleName),
      },
      {
        path: join(basePath, "services", moduleName, `${moduleName}.service.ts`),
        content: getServiceTemplate(moduleName),
      },
      {
        path: join(basePath, "services", moduleName, `${moduleName}.type.ts`),
        content: getServiceTypeTemplate(moduleName),
      },
      {
        path: join(basePath, "model", moduleName, `${moduleName}.model.ts`),
        content: getModelTemplate(moduleName),
      },
      {
        path: join(basePath, "validators", moduleName, `${moduleName}.validation.ts`),
        content: getValidationTemplate(moduleName),
      },
      {
        path: join(basePath, "routes", pascalName, `${moduleName}.route.ts`),
        content: getRouteTemplate(moduleName),
      },
    ];

    for (const file of files) {
      await createFile(file.path, file.content);
    }

    console.log(`\n✅ Module "${moduleName}" generated successfully!`);
    console.log("\n📝 Next steps:");
    console.log("1. Add your specific fields to the model schema");
    console.log("2. Update the validation schemas with your requirements");
    console.log("3. Customize the service methods for your business logic");
    console.log("4. Add the route to your main routes file");
    console.log(
      `5. Import and use: import ${toCamelCase(moduleName)}Route from "@/routes/${pascalName}/${moduleName}.route";`
    );
  } catch (error) {
    console.error("❌ Error generating module:", error.message);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("🚀 E-Book Store Module Generator\n");

  try {
    const moduleName = await askQuestion(
      "Enter the module name (e.g., review, order, category): "
    );

    if (!moduleName) {
      console.log("❌ Module name is required!");
      rl.close();
      return;
    }

    // Validate module name
    if (!MODULE_NAME_REGEX.test(moduleName)) {
      console.log(
        "❌ Invalid module name! Use only letters, numbers, hyphens, and underscores."
      );
      rl.close();
      return;
    }

    console.log(`\n📦 Generating module: "${moduleName}"`);
    console.log("⏳ Creating directories and files...\n");

    await generateModule(moduleName.toLowerCase());
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

export default { generateModule, toPascalCase, toCamelCase };
