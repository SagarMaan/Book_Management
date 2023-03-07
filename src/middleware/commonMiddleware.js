const JWT = require("jsonwebtoken");
const {isValidObjectId} = require("mongoose");

const userModel = require("../model/userModel");
const bookModel = require("../model/bookModel");


// ======================================= AUTHENTICATION =============================================//
const isAuthenticated = async function ( req , res , next ) {
    try {
        let token = req.headers['x-api-key']; 

        if (!token) {
            return res.status(400).send({ status: false, message: "Token must be Present." });
        }

        JWT.verify( token, "project4grp14", function ( err , decodedToken ) {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).send({ status: false, message: "invalid token" });
                }

                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({ status: false, message: "you are logged out, login again" });
                } else {
                    return res.send({ msg: err.message });
                }
            } else {
                req.token = decodedToken;
                next();
            }
        });

    } catch (error) {
        res.status(500).send({ status: 'error', error: error.message });
    }
}
