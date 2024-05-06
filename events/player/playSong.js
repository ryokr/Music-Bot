const db = require("../../mongoDB");
const { EmbedBuilder } = require("discord.js");

module.exports = async (client, queue, song) => {
   if (queue) {
      if (!client.config.opt.loopMessage && queue?.repeatMode !== 0) return;
      if (queue?.textChannel) {
         const embed = new EmbedBuilder()
            .setAuthor({
               name: 'Now Playing',
               iconURL: 'https://cdn.discordapp.com/attachments/1140841446228897932/1144671132948103208/giphy.gif',
               url: 'https://discord.gg/fTuGFk9ayG'
            })
            .setDescription(`\n[${song.name}](${song.url})`)
            .setImage(queue.songs[0].thumbnail)
            .setColor(client.config.embedColor)

         queue?.textChannel?.send({ embeds: [embed] }).catch(e => { });
      }
   }
}
