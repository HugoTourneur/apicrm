/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("navMenu", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.text("hierarchy")
  })

  await knex.schema.alterTable("role", (table) => {
    table.text("permissions").notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("navMenu")
  await knex.schema.alterTable("role", (table) => {
    table.dropColumn("permissions")
  })
}
