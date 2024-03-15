import express from 'express';
import jwt from 'jsonwebtoken';
import Message from '../models/MessageSchema.js';
// Supongamos que tienes un modelo Message para tus mensajes
const GetMessageUser = async (req,res,next) => {
      // Extraer el token de autorización del encabezado de la solicitud
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
    
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    
      try {
        // Decodificar el token para obtener el ID de usuario
        const decodedToken = jwt.verify(token, 'secretKey');
        const userId = decodedToken.userId;
    
        // Buscar todos los mensajes del usuario en la base de datos
        const userMessages = await Message.find({ user: userId });
    
        // Devolver los mensajes encontrados como respuesta
        return res.status(200).json(userMessages);
      } catch (error) {
        console.error('Error retrieving messages:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
   
 
    
}

export default GetMessageUser;