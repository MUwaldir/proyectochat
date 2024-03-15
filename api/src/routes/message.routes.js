import { Router } from "express";
import LoginUser from "../controllers/loginUser.controller.js";
import  RegisterUser from "../controllers/registerUser.controller.js";
import GetMessageUser from "../controllers/getMessageUser.controller.js";
import ValidarToken from "../controllers/ValidarToke.controller.js";
import { autenticacionMiddleware } from "../utils/authenticationMiddleware.js";
import { getUsers } from "../controllers/getUsers.controller.js";
import { getConversation } from "../controllers/getConversation.controller.js";

const routes = Router();

routes.get('/validate', autenticacionMiddleware)
routes.post('/register', RegisterUser)
routes.post('/login', LoginUser)
routes.get('/users', getUsers)
routes.get("/conversation/:otherUserId", autenticacionMiddleware, getConversation)



routes.get('/messages',autenticacionMiddleware, GetMessageUser)
// routes.post('/conversations',autenticacionMiddleware,)



export default routes;