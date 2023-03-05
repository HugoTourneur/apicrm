import BaseModel from "./BaseModel.js"
import PageModel from "./PageModel.js"

class UserModel extends BaseModel {
  static tableName = "users"

  static get relationMappings() {
    return {
      owner: {
        modelClass: PageModel,
        relation: BaseModel.ManyToManyRelation,
      },
    }
  }
}

export default UserModel
