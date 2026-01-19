// bot.js
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');          // SQL backendifga so‘rov
const TOKEN = '7896924437:AAHlbtMj-Zs4grZlviqTD7JwLKhPAIZX1so';
const WEB_APP_URL = 'https://3-orcin-alpha.vercel.app/'; // ← vercel / hosting manzilingiz
const ADMIN_ID = 7961099561;
const SERVER = 'https://yourdomain.com'; // ← server.js joylashgan manzil

const bot = new Telegraf(TOKEN);

// 1. Start → WebApp tugmasi
bot.start(ctx =>
  ctx.reply('Salom! Buyurtma berish uchun quyidagi tugmani bosing:', {
    reply_markup: {
      inline_keyboard: [[
        { text: '🛍 Buyurtma berish', web_app: { url: WEB_APP_URL + 'index.html' } }
      ]]
    }
  })
);

// 2. Admin: /orders → bugungi buyurtmalar (SQLdan)
bot.command('orders', async ctx => {
  if (ctx.from.id != ADMIN_ID) return;
  try {
    const { data } = await axios.get(`${SERVER}/api/admin/orders`);
    if (!data.length) return ctx.reply('📊 Bugungi buyurtmalar yo‘q');
    let txt = '*📊 Bugungi buyurtmalar:*\n\n';
    data.forEach(o => {
      txt += `👤 ${o.name} | 📞 +998${o.phone}\n`;
      txt += `📦 ${o.items}\n`;
      txt += `💰 ${Number(o.total).toLocaleString()} so‘m\n`;
      txt += `📅 ${o.created_at}\n\n`;
    });
    ctx.replyWithMarkdownV2(txt.replace(/\./g, '\\.').replace(/-/g, '\\-'));
  } catch (e) {
    console.error(e);
    ctx.reply('❌ Buyurtmalarni olishda xatolik');
  }
});

// 3. WebAppdan kelgan buyurtmani qabul qilish
bot.on('web_app_data', async ctx => {
  const data = JSON.parse(ctx.message.web_app_data.data);
  const { name, phone, items, total } = data;
  try {
    await axios.post(`${SERVER}/api/orders`, { name, phone, items, total });
    ctx.reply('👍 Buyurtma qabul qilindi');
  } catch (e) {
    console.error(e);
    ctx.reply('❌ Buyurtma qabul qilinmadi');
  }
});
// 3. WebAppdan kelgan oddiy xabarni tekshirish kerak emas –
//    endi buyurtma to‘liq serverga (SQL) yoziladi.
//    Bot faqat admin /orders buyrug‘iga javob beradi.

bot.launch();
console.log('✅ SQL-ga moslangan bot ishga tushdi');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));