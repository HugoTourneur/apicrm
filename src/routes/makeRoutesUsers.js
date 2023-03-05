import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizeUser } from "../sanitizers.js"
import {
  emailValidator,
  idValidator,
  nameValidator,
  queryLimitValidator,
  queryOffsetValidator,
} from "../validators.js"

const makeRoutesUsers = ({ app, db }) => {
  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  app.get(
    "/users",
    auth,
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const { user: sessionUser } = req.session
      const access = await db("role").where({ name: "admin" })

      if (access.id != sessionUser.roleid) {
        throw new InvalidAccessError()
      }

      const users = await UserModel.query().limit(limit).offset(offset)

      res.send({ result: sanitizeUser(users) })
    })
  )

  app.get(
    "/users/:userId",
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const user = await UserModel.query().findById(userId)
      const { user: sessionUser } = req.session
      const access = await db("role").where({ name: "admin" })

      if (!user) {
        return
      }

      if (access.id != sessionUser.roleid) {
        throw new InvalidAccessError()
      }

      res.send({ result: sanitizeUser(user) })
    })
  )

  app.patch(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
      body: {
        firstName: nameValidator,
        lastName: nameValidator,
        email: emailValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { firstName, lastName, email },
          params: { userId },
        },
        session: { user: sessionUser },
      } = req
      const access = await db("role").where({ name: "admin" })

      if (userId !== sessionUser.id) {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(userId, res)

      if (!user) {
        return
      }

      if (access.id != sessionUser.roleid) {
        throw new InvalidAccessError()
      }

      const updatedUser = await UserModel.query().updateAndFetchById(userId, {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
      })

      res.send({ result: sanitizeUser(updatedUser) })
    })
  )

  app.delete(
    "/users/:userId",
    auth,
    validate({
      params: { userId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { userId } = req.data.params
      const user = await checkIfUserExists(userId, res)
      const { user: sessionUser } = req.session
      const access = await db("role").where({ name: "admin" })

      if (!user) {
        return
      }

      if (access.id != sessionUser.roleid) {
        throw new InvalidAccessError()
      }

      await UserModel.query().deleteById(userId)

      res.send({ result: sanitizeUser(user) })
    })
  )
}

export default makeRoutesUsers
