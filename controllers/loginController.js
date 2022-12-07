//Controller for user
import User from "../model/schemas/User.js";
import bcrypt from "bcrypt";
import db from "../model/db.js";

const loginController = {
    // The login page
    login: function (req, res) {
        res.render("login", {
            title: "Login",
            styles: ["pages/login.css"],
            scripts: ["login.js"],
        });
    },

    // Logs in user passed in a post request
    loginUser: async function (req, res) {
        try {
            //Find the user
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                console.log("User not found");
                res.status(400).json({
                    message: "Invalid credentials",
                    fields: ["username", "password"],
                });
                return;
            }

            //Check if the password is correct
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (!isMatch) {
                console.log("Incorrect password");
                res.status(400).json({
                    message: "Invalid credentials",
                    fields: ["username", "password"],
                });
                return;
            }

            req.session.user = user;

            //Check if the user is not suspended
            if (!user.isSuspended) {
                db.updateOne(
                    User,
                    { _id: user._id },
                    { lastLogin: req.body.lastLogin },
                    function (data) {
                        res.sendStatus(200);
                    }
                );
            }
            else res.sendStatus(200);
            return;
        } catch (error) {
            res.status(500).json({ message: "Server error: Login user", details: err });
            return;
        }
    },
    // Logs out user
    logoutUser: function (req, res) {
        try {
            if (req.session) {
                req.session.destroy((err) => {
                    if (err) {
                        res.status(400).send("Unable to log out");
                    } else {
                        res.status(200).send("Logout successful");
                    }
                });
            } else {
                res.end();
            }
        } catch (err) {
            res.status(500).json({ message: "Server error: Logout user", details: err });
            return;
        }
    },
};

export default loginController;