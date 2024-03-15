import Conversation from "../models/ConversationSchema.js";

export const  CreateConversation =async (req, res) => {
    try {
      const { participants } = req.body;
      const newConversation = await Conversation.create({ participants });
      res.status(201).json(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };