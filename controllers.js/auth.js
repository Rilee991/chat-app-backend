const { connect: connectStream } = require("getstream");
const bcrypt = require("bcrypt");
const { StreamChat } = require("stream-chat");
const crypto = require("crypto");

const { STREAM_API_KEY, STREAM_API_SECRET, STREAM_APP_ID } = process.env;

const signup = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber } = req.body;

        const userId = crypto.randomBytes(16).toString("hex");
        const streamClient = connectStream(STREAM_API_KEY, STREAM_API_SECRET, STREAM_APP_ID);

        const hashedPassword = await bcrypt.hash(password, 10);
        const token = streamClient.createUserToken(userId);

        return res.status(200).json({ token, username, fullName, userId, hashedPassword, phoneNumber });
    } catch (e) {
        console.log(e);

        return res.status(500).json({ message: e });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const streamClient = connectStream(STREAM_API_KEY, STREAM_API_SECRET, STREAM_APP_ID);
        const userClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

        const { users } = await userClient.queryUsers({ name: username });

        if(!users.length)  return res.status(400).json({ message: "user doesn't exists" });

        const success = bcrypt.compare(password, users[0].hashedPassword);

        const token = streamClient.createUserToken(users[0].id);

        if(success) return res.status(200).json({ token, username, fullName: users[0].fullName, userId: users[0].id });

        return res.status(500).json({ message: "Incorrect password" });
    } catch (e) {
        console.log(e);

        res.status(500).json({ message: e });
    }
}

module.exports = {
    signup,
    login
}
