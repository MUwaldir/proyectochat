import User from "../models/UserSchema.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const RegisterUser = async(req,res,next) =>{
    try {
        
   
    const {username,email,password} =  req.body;
    // Verifica si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash de la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea un nuevo usuario con los datos proporcionados
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Guarda el nuevo usuario en la base de datos
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
} catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

}

export default RegisterUser;