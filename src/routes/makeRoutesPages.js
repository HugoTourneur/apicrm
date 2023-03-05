import PageModel from "../db/models/PageModel.js"
import UserModel from "../db/models/UserModel.js"
import { InvalidAccessError, NotFoundError } from "../errors.js"
import auth from "../middlewares/auth.js"
import mw from "../middlewares/mw.js"
import validate from "../middlewares/validate.js"
import { sanitizePage } from "../sanitizers.js"
import {
  contentPageValidator,
  idValidator,
  queryLimitValidator,
  queryOffsetValidator,
  titlePageValidator,
} from "../validators.js"

const makeRoutesPages = ({ app, db }) => {
  const checkIfPageExists = async (pageId) => {
    const page = await PageModel.query().findById(pageId)

    if (page) {
      return page
    }

    throw new NotFoundError()
  }

  const checkIfUserExists = async (userId) => {
    const user = await UserModel.query().findById(userId)

    if (user) {
      return user
    }

    throw new NotFoundError()
  }

  app.post(
    "/pages",
    auth,
    mw(async (req, res) => {
      const { title, content, slug, status } = req.body
      const { user: sessionUser } = req.session
      const { userId: creator } = req.query
      const adminAccess = await db("role").where({ name: "admin" })
      const managerAccess = await db("role").where({ name: "manager" })

      if (Number(creator) !== sessionUser.id) {
        throw new InvalidAccessError()
      }

      if (
        adminAccess.id != sessionUser.roleid &&
        managerAccess.id != sessionUser.roleid
      ) {
        throw new InvalidAccessError()
      }

      const user = await checkIfUserExists(creator, res)

      if (!user) {
        return
      }

      const createPage = await PageModel.query().insertAndFetch({
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
        ...(slug ? { slug } : {}),
        ...(creator ? { creator } : {}),
        ...(status ? { status } : "draft"),
      })

      res.send({ result: sanitizePage(createPage) })
    })
  )

  app.get(
    "/pages",
    validate({
      query: {
        limit: queryLimitValidator,
        offset: queryOffsetValidator,
      },
    }),
    mw(async (req, res) => {
      const { limit, offset } = req.data.query
      const pages = await PageModel.query().limit(limit).offset(offset)

      res.send({ result: sanitizePage(pages) })
    })
  )

  app.get(
    "/pages/:pageId",
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { pageId } = req.data.params
      const page = await PageModel.query().findById(pageId)

      if (!page) {
        return
      }

      res.send({ result: sanitizePage(page) })
    })
  )

  app.patch(
    "/pages/:pageId",
    auth,
    validate({
      params: { pageId: idValidator.required() },
      body: {
        title: titlePageValidator,
        content: contentPageValidator,
      },
    }),
    mw(async (req, res) => {
      const {
        data: {
          body: { title, content },
          params: { pageId },
        },
      } = req

      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      const updatedPage = await PageModel.query().updateAndFetchById(pageId, {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
      })

      res.send({ result: sanitizePage(updatedPage) })
    })
  )

  app.delete(
    "/pages/:pageId",
    auth,
    validate({
      params: { pageId: idValidator.required() },
    }),
    mw(async (req, res) => {
      const { pageId } = req.data.params
      const adminAccess = await db("role").where({ name: "admin" })
      const managerAccess = await db("role").where({ name: "manager" })
      const { user: sessionUser } = req.session
      const page = await checkIfPageExists(pageId, res)

      if (!page) {
        return
      }

      if (
        adminAccess.id != sessionUser.roleid &&
        managerAccess.id != sessionUser.roleid
      ) {
        throw new InvalidAccessError()
      }

      await PageModel.query().deleteById(pageId)

      res.send({ result: sanitizePage(page) })
    })
  )
}

export default makeRoutesPages
