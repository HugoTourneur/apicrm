/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("role", (table) => {
    table.increments("id")
    table.text("name", "admin" | "manager" | "editor").notNullable()
  })

  await knex.schema.createTable("user", (table) => {
    table.increments("id")
    table.text("firstname").notNullable()
    table.text("lastname").notNullable()
    table.text("email").notNullable().unique()
    table.integer("roleId").notNullable().references("id").inTable("role")
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("user")
  await knex.schema.dropTable("role")
}
