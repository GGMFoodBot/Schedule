const { SlashCommandBuilder } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v10')
const { clientId, guildIds, token } = require('./config.json')


const commands = [
    new SlashCommandBuilder()
        .setName('시간표')
        .setDescription('시간표 확인')
        .addStringOption(option => option.setName('요일').setDescription('시간표를 확인할 요일을 선택합니다.').setRequired(false)),
    new SlashCommandBuilder()
        .setName('학년설정')
        .setDescription('학년을 설정합니다.')
        .addIntegerOption(option => option.setName('학년').setDescription('학년을 설정합니다.').setRequired(true))
        .addIntegerOption(option => option.setName('반').setDescription('반을 설정합니다.').setRequired(true)),
    new SlashCommandBuilder()
        .setName('단축과목명')
        .setDescription('요약된 과목명의 풀네임을 보여줍니다.')
]

const rest = new REST({version: '9'}).setToken(token);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        })
        console.log("글로벌 서버 등록 성공")
    }
    catch(error) {
        console.error(error)
    }

})()