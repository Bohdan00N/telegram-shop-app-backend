const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const token = process.env.BOT_TOKEN;
const webAppUrl = "https://mythaisushi.netlify.app/";
const bot = new TelegramBot(token, { polling: true });
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "/start") {
    // await bot.sendMessage(chatId, "Заполни форму", {
    //   reply_markup: {
    //     keyboard: [
    //       [{ text: "Сделать заказ", web_app: { url: webAppUrl + "/form" } }],
    //     ],
    //   },
    // });
    await bot.sendMessage(chatId, 'Щоб зробити замовлення натисніть кнопку нижче', {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Зробити замовлення', web_app: {url: webAppUrl + "/form"}}]
            ]
        }
    })
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);
      console.log(data);
      await chatId,
        bot.sendMessage(
          chatId,
          "Дякую за заповлення!" + data?.city + data?.street
        );
    } catch (e) {
      console.log(e);
    }
  }
});
app.post('/order', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішно',
            input_message_content: {
                message_text: ` Дякую за замовлення, ваша сума складає ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})
app.listen(process.env.PORT, () => console.log("server started on PORT " + process.env.PORT));
