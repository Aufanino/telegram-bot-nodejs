var fetch = require("node-fetch");
class telegram {
    constructor(token_bot) {
        this.token_bot = token_bot;
        this.url = `https://api.telegram.org/bot`;
    }
    async request(method, data) {
        if (!this.token_bot) {
            throw new Error("please fill token bro");
        }
        if (!method) {
            throw new Error("please fill method bro");
        }
        var option = {
            "method": "post",
            "headers": {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }
        if (data) {
            option["body"] = JSON.stringify(data);
        }
        var response = await fetch(`${this.url}${this.token_bot}/${method}`, option).then(res => res.json());
        if (response.ok) {
            return response;
        } else {
            throw new Error(response.description);
        }
    }
}


var tg = new telegram("token_bot");
const fastify = require('fastify')({
    logger: false,
    ignoreTrailingSlash: true,
    trustProxy: true
})

// Declare a route
fastify.get('/', async function (request, reply) {
    return reply.send("Bot Run")
})

fastify.post('/', async function (request, reply) {
    var update = request.body;
    console.log(JSON.stringify(update, null, 2))
    if (update) {
        try {

            if (update.callback_query) {
                var cb = update.callback_query;
                var cbm = cb.message;
                var user_id = cb.from.id;
                var chat_id = cbm.chat.id;
                var text = cb.data;

                if (text == "infobot") {
                    var parameter = {
                        "chat_id": chat_id,
                        "message_id": cbm.message_id,
                        "text": "Bot version beta test node js",
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Close",
                                        "callback_data": "close"
                                    }
                                ]
                            ]
                        }
                    }
                    return tg.request("editMessageText", parameter);
                }

                if (text == "close") {
                    var parameter = {
                        "chat_id": chat_id,
                        "message_id": cbm.message_id
                    }
                    return tg.request("deleteMessage", parameter);
                }
            }

            if (update.message) {
                var msg = update.message;
                var chat_id = msg.chat.id;
                var user_id = msg.from.id;
                var text = msg.text;
                var msg_id = msg.message_id;

                if (text == "/start") {
                    var parameter = {
                        "chat_id": chat_id,
                        "text": "Hello there how are you",
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "GOOGLE",
                                        "url": "google.com"
                                    }
                                ],
                                [
                                    {
                                        "text": "Info Bot",
                                        "callback_data": "infobot"
                                    }
                                ]
                            ]
                        }
                    }
                    return tg.request("sendMessage", parameter)
                }
            }
        } catch (e) {
            if (update.callback_query) {
                var cb = update.callback_query;
                var cbm = cb.message;
                var user_id = cb.from.id;
                var chat_id = cbm.chat.id;
                var text = cb.data;
                var parameter = {
                    "chat_id": chat_id,
                    "text": `Error ${e.message}`
                }
                return tg.request("sendMessage", parameter)
            }
            if (update.message) {
                var parameter = {
                    "chat_id": update.message.chat.id,
                    "text": `Error ${e.message}`
                }
                return tg.request("sendMessage", parameter)
            }
        }
    }
    return reply.send("Bot Run")
})


// Run the server!
async function start() {
    try {
        await fastify.listen(3000)
        console.log("server run on port 3000")
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()