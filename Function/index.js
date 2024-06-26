const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder } = require('discord.js')
const { DisTubeHandler, Playlist } = require('distube')
const fs = require('fs').promises

module.exports = {
   auth,
   reject,
   handleCommand,
   handleModalSubmit,
   playMusic,
   hasFilter,
   getSecond,
   deleteMessage,
   capFirstChar,
   formatTime,
   loadButton,
   getTime,
   updateEmbed,
   generateQueuePage,
   queueActionRow,
   showModal,
   printData,
   createGuild,
   leaveGuild,
   listGuilds,
   sleep,
}

// interactionCreate
function auth(client, interaction) {
   return interaction.guild.id === client.config.player.guildId && interaction.member.roles.cache.has(client.config.player.dj)
}
async function reject(interaction) {
   await interaction.reply({ content: `I'm sleeping, Call <@677857271530651649> Please ❤️‍🔥`, ephemeral: true })
}
async function handleCommand(client, interaction) {
   const execute = async (path) => {
      try {
         const files = await fs.readdir(path)
         for (const file of files) {
            const props = require(`${path}/${file}`)

            if (interaction.commandName === props.name) {
               if (!auth(client, interaction)) {
                  reject(interaction)
                  return
               }

               if (props.voiceChannel && !interaction.member.voice.channelId) {
                  deleteMessage(await interaction.reply({ content: 'Join Voice Channel' }), 10000)
                  return
               }

               await props.run(client, interaction)
               return
            }
         }
         await interaction.reply({ content: 'Command not found.', ephemeral: true })
      } catch (e) {
         console.error('❌ Command Load Error\n', e)
         await interaction.reply({ content: 'Failed to load command.', ephemeral: true })
      }
   }

   await execute(__dirname + '/../Commands')
}
async function handleModalSubmit(client, interaction) {
   const queue = client.player.getQueue(interaction.guild.id)
   const embed = new EmbedBuilder().setColor(client.config.player.embedColor)

   if (interaction.customId === 'playerAddModal') {
      await handleAddModal(client, interaction, embed)
   } else if (interaction.customId === 'playerSeekModal') {
      await handleSeekModal(interaction, queue, embed)
   } else if (interaction.customId === 'playerVolumeModal') {
      await handleVolumeModal(client, interaction, queue, embed)
   }
}
async function handleAddModal(client, interaction, embed) {
   const songName = interaction.fields.getTextInputValue('playerAddInput')

   if (!interaction.member.voice.channel) {
      embed.setDescription('Join voice channel')
      deleteMessage(await interaction.reply({ embeds: [embed] }), 5000)
   } else {
      embed.setDescription('Meowing')
      const msg = await interaction.reply({ embeds: [embed] })

      await playMusic(client, interaction, songName)
      deleteMessage(msg, 5000)
   }
}
async function handleSeekModal(interaction, queue, embed) {
   const value = interaction.fields.getTextInputValue('playerSeekInput')
   const position = getSecond(value)

   if (!queue || !queue.playing) {
      embed.setDescription('No music playing')
   } else if (isNaN(position)) {
      embed.setDescription('Invalid time format. Use: 2h 3m 4s')
   } else {
      await queue.seek(position)
      embed.setDescription(`Seeked to ${value}`)
   }

   deleteMessage(await interaction.reply({ embeds: [embed] }), 5000)
}
async function handleVolumeModal(client, interaction, queue, embed) {
   const maxVol = client.config.player.maxVol
   const vol = parseInt(interaction.fields.getTextInputValue('playerVolumeInput'))

   if (!queue || !queue.playing) {
      embed.setDescription('No music playing')
   } else if (queue.volume === vol) {
      embed.setDescription(`Volume is already set to ${vol}`)
   } else if (!vol || vol < 1 || vol > maxVol) {
      embed.setDescription(`Type a number between 1 and ${maxVol}`)
   } else {
      await queue.setVolume(vol)
      embed.setDescription(`Set the volume to ${vol}`)
   }

   deleteMessage(await interaction.reply({ embeds: [embed] }), 10000)
}

// Play
async function playMusic(client, interaction, name) {
   if (!name.includes('list=RD')) {
      playSong(client, interaction, name)
   } else {
      const listUrl = await getVideoUrls(name)
      const first = listUrl.shift()
      playSong(client, interaction, first)

      const distube = new DisTubeHandler(client.player)
      const songs = []

      for (const url of listUrl) {
         songs.push(await distube.resolve(url))
      }
      const list = new Playlist(songs)
      playSong(client, interaction, list)
   }
}
async function playSong(client, interaction, name) {
   await client.player
      .play(interaction.member.voice.channel, name, {
         member: interaction.member,
         textChannel: interaction.channel,
         interaction,
      })
      .catch(() => {})
}
async function getVideoUrls(url) {
   try {
      const response = await fetch(url)
      const data = await response.text()
      const listUrl = []
      const regex = /\/watch\?v=([\w-]+)/g
      let match

      while ((match = regex.exec(data)) !== null) {
         const videoId = match[1]
         const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
         if (!listUrl.includes(videoUrl)) {
            listUrl.push(videoUrl)
         }
      }
      return listUrl
   } catch (error) {
      throw error
   }
}

// Filter
function hasFilter(queue, filter) {
   return queue.filters.has(filter) ? '🟢' : '🟠'
}

// Seek
function getSecond(str) {
   if (!str) return 0

   const timeUnits = { h: 3600, m: 60, s: 1 }
   const timeParts = str.split(' ')

   let totalSeconds = 0
   for (const part of timeParts) {
      const match = part.match(/^(\d+)([hms])$/)
      if (!match) return NaN

      const value = parseInt(match[1])
      const unit = match[2]

      totalSeconds += value * timeUnits[unit]
   }
   return totalSeconds
}

function deleteMessage(message, time) {
   setTimeout(async () => {
      if (message) await message.delete().catch(() => {})
   }, time)
}

function capFirstChar(string) {
   if (!string) return ' '
   return string.charAt(0).toUpperCase() + string.slice(1)
}

function formatTime(duration) {
   if (duration === 'Live') return duration

   const parts = duration.split(':').map(Number)

   if (parts.length === 3) {
      return `${parts[0]}h ${parts[1]}m ${parts[2]}s`
   } else if (parts.length === 2) {
      if (parts[0] === 0) return `${parts[1]}s`
      return `${parts[0]}m ${parts[1]}s`
   } else {
      return `${parts[0]}s`
   }
}

function loadButton(path, ...args) {
   return async () => require(path)(...args)
}

function getTime() {
   const time = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
   })
   return `Today at ${time}`
}
async function updateEmbed(interaction, currentMsg, embed) {
   await Promise.all([currentMsg.edit({ embeds: [embed] }), interaction.deferUpdate()]).catch(() => {})
}

// Queue
function generateQueuePage(client, queue, start, page, total, pageLength, songList) {
   let index = start + 1
   const current = songList.slice(start, start + pageLength)
   return new EmbedBuilder()
      .setColor(client.config.player.embedColor)
      .setAuthor({ name: '─────・ P L A Y  L I S T 🌱・─────', iconURL: queue.textChannel.guild.iconURL() })
      .setDescription(current.map((song) => `\n${index++}. [${song.name}](${song.url})・${formatTime(song.duration)}`).join(''))
      .setFooter({ text: `💽 • Page ${page} / ${total}` })
}
function queueActionRow(page, total) {
   return new ActionRowBuilder().addComponents(
      new ButtonBuilder({ custom_id: 'queueFirst', label: 'First Page', style: 2 }).setDisabled(page === 1),
      new ButtonBuilder({ custom_id: 'queueBack', label: 'Previous Page', style: 2 }).setDisabled(page === 1),
      new ButtonBuilder({ custom_id: 'queueNext', label: 'Next Page', style: 2 }).setDisabled(page === total),
      new ButtonBuilder({ custom_id: 'queueLast', label: 'Last Page', style: 2 }).setDisabled(page === total),
      new ButtonBuilder({ custom_id: 'queueClose', label: 'Close', style: 4 })
   )
}

// Modal
async function showModal(interaction, customId, title, inputId, label, placeholder) {
   const modal = new ModalBuilder().setCustomId(customId).setTitle(title)

   const textInput = new TextInputBuilder()
      .setCustomId(inputId)
      .setLabel(label)
      .setStyle('Short')
      .setPlaceholder(placeholder)

   modal.addComponents(new ActionRowBuilder().addComponents(textInput))
   await interaction.showModal(modal)
}

function getGuilds(client) {
   const guildNames = client.guilds.cache.map((guild) => guild.name).join('\n')
   fs.writeFile('guilds.txt', guildNames, (error) => {
      if (error) {
         console.log('Error writing to file:', error)
      } else {
         console.log('Guild names have been written to guilds.txt')
      }
   })
}

function generateGuildName() {
   return `B-${Math.floor(100000 + Math.random() * 900000)}`
}

async function createGuild(token) {
   try {
      const serverName = generateGuildName()

      const headers = {
         'Content-Type': 'application/json',
         Authorization: `Bot ${token}`,
      }
      const data = {
         name: serverName,
         icon: null,
         channels: [],
         system_channel_id: null,
      }
      const response = await fetch(`https://discord.com/api/v9/guilds`, {
         method: 'POST',
         headers: headers,
         body: JSON.stringify(data),
      })

      if (!response.ok) {
         return 'Failed to create server'
      }

      const guildData = await response.json()
      return `Created server: ID: ${guildData.id} | Name: ${serverName}`
   } catch (error) {
      return 'Error creating server:', error
   }
}

async function leaveGuild(client, guildId) {
   try {
      const guild = await client.guilds.fetch(guildId)
      guild.ownerId === client.user.id ? await guild.delete() : await guild.leave()

      console.log(`Successfully left the guild: ID: ${guild.id} | Name: ${guild.name}`)
   } catch (error) {
      console.log(`Failed to leave or delete the guild: ${guildId}`, error)
   }
}

function listGuilds(client, interaction) {
   let index = 1
   client.guilds.cache.forEach(async (guild) => {
      await interaction.channel.send({ content: `\`\`\`${index}. ID: ${guild.id}      | Name: ${guild.name}\`\`\`` })
      index++
   })
}

async function sleep(ms) {
   await new Promise((resolve) => setTimeout(resolve, ms))
}

function printData(data) {
   console.log(data)
}