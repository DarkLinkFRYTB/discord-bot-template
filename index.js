const myClient = require('./Bot/Client.js'), bot = new myClient.Client("PUT_YOUR_TOKEN_HERE", "Your prefix here");
bot.login();
/**
 * Reconnect the bot when 20 minutes are passed
 */
setInterval(async () => {
    await bot.client.destroy();
    delete bot; 
    let bot = new myClient.Client("PUT_YOUR_TOKEN_HERE", "Your prefix here");
    bot.login("Bot has reconnected");
}, 1000 * 60 * 20);