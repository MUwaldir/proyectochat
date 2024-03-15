// Importar los modelos necesarios

import Conversation from "../models/ConversationSchema.js";

// Controlador para encontrar una conversación existente para un usuario
export const getConversation = async (req, res) => {
  const userId = req.user.userId;
  const otherUserId = req.params.otherUserId;
  console.log(`userId: ${userId}, otherUserId: ${otherUserId}`);
  try {
    // Buscar la conversación que involucra a los dos usuarios
    // const conversation = await Conversation.findOne({
    //     // participants: { $all: [userId, otherUserId], $size: 2 }
    //     participants: {
    //         $all: [
    //           { $elemMatch: { $eq: userId } },
    //           { $elemMatch: { $eq: otherUserId } }
    //         ],
    //         $size: 2
    //       }
    // }).populate("participants").populate({
    //     path: "messages",
    //     populate: { path: "sender" }
    //   });

    if (userId === otherUserId) {
        const conversation = await Conversation.findOne({
            participants:  [userId, otherUserId] 
          })
            .populate("participants")
            .populate({
              path: "messages",
              populate: { path: "sender" },
            });
          if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
          }

          console.log("conversation de si mismo236 : "+ conversation) 
    
          res.json(conversation);
    } else {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, otherUserId], $size: 2 },
      })
        .populate("participants")
        .populate({
          path: "messages",
          populate: { path: "sender" },
        });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.json(conversation);
    }

    // // console.log("el conversation : ", conversation);
    // console.log("el conversation : " + conversation);

    // // console.log(messages);
    // if (!conversation) {
    //   return res.status(404).json({ error: "Conversation not found" });
    // }

    // res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
