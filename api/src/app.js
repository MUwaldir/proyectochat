import express from "express";
import morgan from "morgan";
import cors from "cors";
import jwt from "jsonwebtoken";
import http from "http";
import { Server } from "socket.io";

import Conversation from "./models/ConversationSchema.js";
import Message from "./models/MessageSchema.js";
import routes from "./routes/message.routes.js";
import User from "./models/UserSchema.js";

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const activeSockets = new Map();
// Manejar conexiones de socket
io.on("connection", (socket) => {
  console.log("A user connected");

  // Escuchar por eventos de autenticación del usuario
  socket.on("authenticate", (token) => {
    console.log("soy el token : " + token);
    try {
      // Verificar y decodificar el token de autenticación
      const decodedToken = jwt.verify(token, "secretKey");

      // Extraer la información del usuario del token
      const userId = decodedToken.userId;

      // Asociar el socket con el usuario autenticado
      socket.userId = userId;
      activeSockets.set(userId, socket); // Agregar el socket al mapa
      console.log(`User ${userId} authenticated`);
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
  });

  // Crear una nueva conversación
  // Manejar la creación de conversación

  socket.on("createConversation", async (selectedUserId) => {
    try {
      // Buscar si ya existe una conversación entre los dos usuarios
      if (socket.userId && selectedUserId) {
        // Verificar si el usuario está intentando iniciar una conversación consigo mismo
        if (socket.userId === selectedUserId) {
          // Crear una conversación especial para el usuario consigo mismo
          const selfConversation = await Conversation.findOne({
            participants: [socket.userId, socket.userId],
          });

          console.log(
            "esta es coversatio de sis mismo .existe o no: " + selfConversation
          );
          if (!selfConversation) {
            // Si no existe una conversación consigo mismo, crearla
            const conversation = new Conversation({
              participants: [socket.userId, socket.userId],
            });
            await conversation.save();
            console.log("Conversación consigo mismo creada:", conversation);

            // Emitir la conversación creada al cliente

            socket.emit("conversationCreated", conversation);
          } else {
            // Si la conversación consigo mismo ya existe, emitirla al cliente

            socket.emit("conversationCreated", selfConversation);
          }
        } else {
          // Buscar si ya existe una conversación entre los dos usuarios
          const existingConversation = await Conversation.findOne({
            participants: { $all: [socket.userId, selectedUserId] },
          });

          console.log("conversation de usuario difre: " + existingConversation);
          if (existingConversation) {
            // Si la conversación ya existe, emitir la conversación existente al cliente
            // io.emit("conversationCreated", existingConversation);
            socket.emit("conversationCreated", existingConversation);
          } else {
            // Si no existe una conversación, crear una nueva
            const conversation = new Conversation({
              participants: [socket.userId, selectedUserId],
            });
            await conversation.save();
            console.log("Conversación creada:", conversation);

            // Emitir la conversación creada al cliente
            // io.emit("conversationCreated", conversation);
            socket.emit("conversationCreated", conversation);
          }
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  });

  // Escuchar por mensajes de chat
  socket.on("message", async (msg) => {
    console.log("Message:", msg);
    const userId = socket.userId;
    const conversationId = msg.conversationId;
    const sender = await User.findById(socket.userId);

    try {
      if (userId === conversationId) {
        // Buscar la conversación que involucra a los dos usuarios y tiene el ID correcto
        const conversation = await Conversation.findOne({
          participants: [userId, userId],
        });
        if (!conversation) {
          console.error("Conversation not found");
          return;
        }

        // Guardar el mensaje en la base de datos
        const message = new Message({
          conversation: msg.conversationId,
          sender: socket.userId,
          content: msg.content,
        });
        await message.save();
        await Conversation.findByIdAndUpdate(conversation._id, {
          $push: { messages: message._id },
        });

        const dataRecibido = {
          messageId: message._id,
          content: msg.content,
          senderId: socket.userId,
          senderUsername: sender.username,
          conversationId: conversationId,
        };
        console.log("Emitting message to clients:", dataRecibido);

        const userSocket = activeSockets.get(userId);

        // // Emitir evento para indicar que el mensaje fue enviado
        if (userSocket) {
          userSocket.emit("messageSent", dataRecibido);
        } else {
          console.log("El socket del usuario no está activo");
        }

        console.log("mesnaje enviado aal usuario");
      } else {
        // Buscar la conversación que involucra a los dos usuarios y tiene el ID correcto
        const conversation = await Conversation.findOne({
          participants: { $all: [userId, conversationId] },
        });
        console.log(
          "busca del conversation antes de crear message: " + conversation
        );
        console.log("este es id del conversation): " + conversation._id);

        if (!conversation) {
          console.error("Conversation not found");
          return;
        }
        // Guardar el mensaje en la base de datos
        const message = new Message({
          conversation: msg.conversationId,
          sender: socket.userId,
          content: msg.content,
        });
        await message.save();
        await Conversation.findByIdAndUpdate(conversation._id, {
          $push: { messages: message._id },
        });

        console.log("Message saved to database");
        // Emitir el mensaje a todos los clientes en la conversación
        const dataRecibido = {
          messageId: message._id,
          content: msg.content,
          senderId: socket.userId,
          senderUsername: sender.username,
          conversationId: conversationId,
        };
        console.log("Emitting message to clients:", dataRecibido);

        const userSocket = activeSockets.get(userId);
        const userSocketConversation = activeSockets.get(conversationId);
        if (userSocketConversation) {
          userSocketConversation.emit("messageReceived", dataRecibido);
        } else {
          console.log("El socket del usuario no está activo");
        }

        // Emitir evento específico para notificar al receptor
        // io.to(conversationId.toString()).emit("messageReceived", dataRecibido);
        // // Emitir evento para indicar que el mensaje fue enviado
        if (userSocket) {
          userSocket.emit("messageSent", dataRecibido);
        } else {
          console.log("El socket del usuario no está activo");
        }
        // io.to(userId.toString()).emit("messageSent", messageData);
        // console.log(io.to(userId.toString()));
        // socket.emit("messageSent", messageData);
        console.log("mesnaje enviado aal usuario");
      }
    } catch (error) {
      console.error("Error saving or broadcasting message:", error);
    }
  });

  // Manejar desconexiones de socket
  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

app.use("/api", routes);
app.use("/", (req, res) => res.send("bienvenido al api portfolio"));

export default server;
