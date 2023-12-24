const express = require('express')
const http = require("http");
const cors = require("cors");
const app = express();
const server = http.createServer(app);
const MongoDBClient = require("./common/mongodb/mongodb");

app.use(cors());
const socketIo = require("socket.io")(server, {
    cors: {
        origin: "https://chat-app-steel-two.vercel.app",
    }
});
// nhớ thêm cái cors này để tránh bị Exception nhé :D  ở đây mình làm nhanh nên cho phép tất cả các trang đều cors được.

app.get('/:conversationId', async (req, res) => {
    const conversationId = req.params.conversationId;
    const conversationClient = await new MongoDBClient(
        'mongodb+srv://hdnqt:hdnqt@cluster0.aok644y.mongodb.net/?retryWrites=true&w=majority',
        'chat-app',
        "conversation"
    );
    const conversation = await conversationClient.getOne({_id: conversationId})
    res.send(conversation)
})



socketIo.on("connection", async (socket) => { ///Handle khi có connect từ client tới
    console.log("New client connected: " + socket.id);

    socket.on('init', async (email) => {
        const conversationClient = await new MongoDBClient(
            'mongodb+srv://hdnqt:hdnqt@cluster0.aok644y.mongodb.net/?retryWrites=true&w=majority',
            'chat-app',
            "conversation"
        );
        const conversations = await conversationClient.queryAllWithProjection({members: email}, {messages: 0})

        socket.join(email)
        conversations.forEach(conversation => {
            socket.join(conversation._id)
        })
        console.log(conversations)
        socketIo.to(email).emit('init', conversations)
    })

    socket.on("send", async function (data) { // Handle khi có sự kiện tên là sendDataClient từ phía client
        const conversationId = data.conversation_id
        const msg = {
            sender: data.sender,
            content: data.content,
            send_time: data.send_time
        }
        const conversationClient = await new MongoDBClient(
            'mongodb+srv://hdnqt:hdnqt@cluster0.aok644y.mongodb.net/?retryWrites=true&w=majority',
            'chat-app',
            "conversation"
        );
        const conversation = await conversationClient.getOne({_id: conversationId})
        const newMessages = [...conversation.messages, msg]

        await conversationClient.updateOne({_id: conversationId}, {messages: newMessages, last_message: msg})
        socketIo.to(conversationId).emit('receive', msg)
    })

    socket.on("disconnect", () => {
        console.log("Client disconnected"); // Khi client disconnect thì log ra terminal.
    });
});

server.listen(process.env.PORT, () => {
    console.log('Server đang chay tren cong 3001');
});