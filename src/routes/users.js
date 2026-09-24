const {Router} = require('express');
const bcrypt = require('bcryptjs');
const Users = require('../models/User')
const routes = new Router();

routes.post('/register', async(req,res) => {
    try {
    const { name, age, email, password, role} = req.body();
    const alreadyexist = await Users.find({email});
    if(alreadyexist){
        console.log('User already exist with this email');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        name,
        age,
        email,
        password: hashedPassword,
        role
    };
    const data = await Users.create(user);
    return res.status(201).json({data, message: 'User Created Successfully'});

    } catch (error) {
        return console.log('Error in creation of user', error)
    }

});

routes.post('/login', async(req,res) => {
try {
        const { email, password } = req.body;

        let user = await Users.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = routes;
