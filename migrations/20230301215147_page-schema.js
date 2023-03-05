/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("page", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.text("slug").notNullable().unique()
    table
      .integer("creator")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("")
    table.timestamps(true, true, true)
    table.text("status", "draft" | "published")
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("page")
}
