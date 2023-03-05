import BaseModel from "./BaseModel.js"
import UserModel from "./UserModel.js"

class PageModel extends BaseModel {
  static tableName = "page"

  static get relationMappings() {
    return {
      users: {
        modelClass: UserModel,
        relation: PageModel.HasManyRelation,
        join: {
          from: "users.id",
          to: "page.creator",
        },
      },
    }
  }
}

export default PageModel
