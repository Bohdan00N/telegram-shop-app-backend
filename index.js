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
    await bot.sendMessage(
      chatId,
      "Натисни кнопку 'Меню', щоб зробити замовлення",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Сделать заказ", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }
});
app.post("/order", async (req, res) => {
  const { queryId, products = [], totalPrice, clientData = [] } = req.body;
  if (!queryId || !products.length || !totalPrice || !clientData) {
    return res.status(400).json({ error: "Невірні дані" });
  }

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Успішно",
      input_message_content: {
        message_text: `Успішно! Ви замовили ${products
          .map((item) => `${item.title} (${item.description})`)
          .join(
            ", "
          )}. Ваша сума складає ${totalPrice} гривень. Номер телефону: ${clientData.map(
          (item) => `${item.phone}`
        )}`,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});
app.listen(process.env.PORT, () => console.log("server started on PORT " + process.env.PORT));
