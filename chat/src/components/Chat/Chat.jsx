import React, { useState, useEffect, useRef } from "react";
import WebSocket from "../../services/webSocket";
import EmojiPicker from "emoji-picker-react";
import Home from "../Home";
const URLAPI = "http://localhost:3001";

function Chat({
  isAuthenticated,
  setIsAuthenticated,
  userId,
  userAuthenticated,
}) {
  // Ref para el contenedor de mensajes
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState(null);
  const [foundUsers, setFoundUsers] = useState([]);

  const token = localStorage.getItem("authToken");
  // console.log(messages)

  // Función para hacer scroll al final del contenedor de mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleMessageReceived = (dataRecibido) => {
    console.log("Evento messageReceived recibido:", dataRecibido);
    console.log(
      "Id del usuario que es receptor: " + dataRecibido.conversationId
    );
    console.log("Id del usuario  en ejcucion: " + userId);
    console.log(
      "Id del el tercer usuario que es emisor del mensaje: " +
        dataRecibido.senderId
    );
    console.log(
      "id del usuario abierto para enviar chat " + selectedRecipientId
    );

    // Verificar si el mensaje es para el chat actual
    if (dataRecibido.senderId === selectedRecipientId) {
      console.log("El mensaje es para el chat actual");

      const messageData = {
        content: dataRecibido.content,
        username: dataRecibido.senderUsername,
      };

      // Verificar si el mensaje ya está presente en el estado
      if (!messages.some((msg) => msg.messageid === dataRecibido.messageId)) {
        setMessages((prevMessages) => [...prevMessages, messageData]); // Agregar el nuevo mensaje al estado
      }
    } else {
      console.log("El mensaje no es para el chat actual");
      // Aquí podrías agregar lógica para manejar la actualización de otro chat si lo deseas
    }
  };

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    WebSocket.connect();
    WebSocket.emit("authenticate", token);

    // Manejar la recepción de mensajes entrantes

    // Escuchar la respuesta del servidor cuando se envía un mensaje

    WebSocket.on("conversationCreated", (conversation) => {
      console.log("hi webeoscte resp conversationCreated");
      console.log(conversation);
    });

    return () => WebSocket.disconnect();
  }, []);

  useEffect(() => {
    // ...
    WebSocket.on("messageReceived", handleMessageReceived);

    return () => {
      // Limpiar el evento cuando el componente se desmonte
      WebSocket.off("messageReceived", handleMessageReceived);
    };
  }, [selectedRecipientId]);

  useEffect(() => {
    const handleSentMessage = (messageData) => {
      console.log("Mensaje enviado recibido:", messageData);
      const messageDataClient = {
        content: messageData.content,
        username: messageData.senderUsername,
      };

      // Verificar si el mensaje ya está presente en el estado
      if (!messages.some((msg) => msg.messageid === messageData.messageId)) {
        setMessages((prevMessages) => [...prevMessages, messageDataClient]); // Agregar el nuevo mensaje al estado
      }
    };

    WebSocket.on("messageSent", handleSentMessage);
    scrollToBottom();
    //   setMessages((prevMessages) => [...prevMessages, messageDataClient]);
    return () => {
      WebSocket.off("messageSent");
    };
  }, [messages]);

  const authenticateUser = (token) => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    WebSocket.emit("authenticate", token);
  };

  // Manejar cuando el usuario selecciona a otro usuario para chatear

  const handleUserSelection = async (selectedUserId) => {
    authenticateUser(token);

    // Verificar si ya existe una conversación con el usuario seleccionado
    const existingConversation = await findExistingConversation(selectedUserId);

    if (existingConversation) {
      // Mostrar la conversación existente en la interfaz
      console.log(existingConversation.messages);
      const dataMessage = existingConversation.messages.map((message) => {
        return {
          content: message.content,
          username: message.sender.username,
          messageid: message._id,
        };
      });

      console.log(dataMessage);
      //   setMessages(existingConversation.messages);
      setMessages(dataMessage);
    } else {
      // Enviar una solicitud al backend para crear una nueva conversación
      WebSocket.emit("createConversation", selectedUserId);
    }
  };

  // Función para encontrar una conversación existente con el usuario seleccionado

  const findExistingConversation = async (selectedUserId) => {
    console.log(
      "este es el idusuaria a consultar si tengoo conversations " +
        selectedUserId
    );
    try {
      // Realizar una solicitud al backend para buscar la conversación existente
      const response = await fetch(
        `${URLAPI}/api/conversation/${selectedUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const existingConversationData = await response.json();
        // Retornar la conversación existente si se encuentra
        return existingConversationData;
      } else {
        console.log("erroa l pedir conversation porque no hay");
        // No se encontró una conversación existente
        return null;
      }
    } catch (error) {
      console.error("Error fetching existing conversation:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowEmojiPicker(false);
    if (inputMessage.trim() === "") {
      return;
    }

    if (!selectedRecipientId) {
      console.error("No recipient selected");
      return;
    }
    const message = {
      content: inputMessage,
      conversationId: selectedRecipientId,
    };

    try {
      WebSocket.emit("message", message);
      // Limpiar el inputMessage después de enviar el mensaje
      setInputMessage("");
      // Aquí puedes actualizar localmente la lista de mensajes con el mensaje recién enviado
    } catch (error) {
      console.error("Error handling submit:", error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputMessage(inputMessage + emoji.emoji);
  };

  const handleSearchUser = async () => {
    try {
      let url = `${URLAPI}/api/users`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const userData = await response.json();
      setFoundUsers(userData);
    } catch (error) {
      console.error("Error searching for user:", error);
      // Puedes mostrar un mensaje al usuario indicando que no se encontraron usuarios
    }
  };

  const handleInputClick = async () => {
    try {
      //   const response = await fetch(`${URLAPI}/api/users/random?limit=10`, {
      const response = await fetch(`${URLAPI}/api/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch random users");
      }

      const userData = await response.json();
      setFoundUsers(userData.users);
    } catch (error) {
      console.error("Error fetching random users:", error);
      // Puedes mostrar un mensaje al usuario indicando que no se encontraron usuarios aleatorios
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex justify-between items-center  bg-gray-200"
      >
        <div className="flex-grow flex justify-start items-center z-50 bg-gray-300">
          {isAuthenticated && selectedRecipientId && (
            <>
              {/* Botón de flecha hacia atrás */}
              {searchUsername && selectedRecipientId && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchUsername("");
                    setSelectedRecipientId(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  ←
                </button>
              )}
              <img
                src="https://randomuser.me/api/portraits/women/2.jpg"
                alt=""
                className="rounded-full w-12 h-12  mx-4 shadow-md"
              />
              <p>
                Chat con{" "}
                <span className="text-md text-black h-full bg-white rounded-md px-2 py-1 shadow-md font-bold">
                  {searchUsername}
                </span>
              </p>
            </>
          )}
        </div>
      </form>

      {isAuthenticated ? (
        selectedRecipientId ? (
          <>
            <div className="flex flex-col w-full absolute  bottom-0">
              <div className=" bg-gray-100  h-screen  overflow-y-auto ">
                {messages &&
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex w-full p-2 my-1   justify-${
                        message.username === userAuthenticated ? "end" : "start"
                      } `}
                      //   style={{
                      //     width: "80%", // Ancho del 80% en pantallas pequeñas
                      //     maxWidth: "50%", // Ancho máximo del 50% en pantallas grandes
                      //     margin: "0 auto", // Centra el mensaje horizontalmente
                      //   }}
                    >
                      <div className={`w-full   `}>
                        <div
                          className={` flex ${
                            message.username === userAuthenticated
                              ? "justify-end ml-10"
                              : "justify-start mr-10"
                          }  `}
                        >
                         
                          <div
                            className={`${
                              message.username === userAuthenticated
                                ? "bg-blue-500"
                                : "bg-gray-700"
                            }  text-white rounded-lg p-2 h-auto max-w-96`}
                          >
                             <div className="text-black bg-slate-400 rounded px-2 ">
                            {message.username}
                          </div>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {/* Referencia para hacer scroll al final */}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex justify-between items-center p-2 bg-gray-200"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow px-4 py-2 mr-2 border border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  🙂
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </form>
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-2 z-10">
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-full flex justify-center pt-2 ">
              <input
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Search for users..."
                className=" py-2 border w-3/4 px-2 border-gray-400 rounded-lg focus:outline-none focus:border-blue-500"
                onClick={handleInputClick}
              />
              <button
                type="button"
                onClick={handleSearchUser}
                className="bg-blue-500 w-1/4 text-white  py-2 rounded-lg ml-2"
              >
                Search
              </button>
            </div>
            {!selectedRecipientId && (
              <div className="flex flex-col mt-2">
                <h3 className="text-lg font-bold">Found Users</h3>
                {foundUsers.length > 0 ? (
                  <ul className="mt-2">
                    {foundUsers.map((user) => (
                      <li
                        key={user._id}
                        className="border-b px-2 mb-1 cursor-pointer h-10 flex bg-slate-200"
                        onClick={() => {
                          setSelectedRecipientId(user._id);
                          handleUserSelection(user._id);
                          setSearchUsername(user.username);
                        }}
                      >
                        <img
                          src="https://picsum.photos/200/300"
                          alt=""
                          className=" w-10 rounded-full"
                        />
                        <span className="text-lg mx-2">{user.username}</span>
                        <span className="text-lg">{user.email}</span>
                        {/* Agrega más detalles del usuario aquí si es necesario */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-gray-500">No users found</p>
                )}
              </div>
            )}
          </>
        )
      ) : (
        <>
          <div className="flex  flex-col items-center justify-center absolute w-full bottom-1.5 ">
            <Home />
          </div>
        </>
      )}
    </>
  );
}

export default Chat;
