require('./server.js')

// 컴시간 파서 불러오기
const Timetable = require('comcigan-parser');
const timetable = new Timetable();
// 디스코드 봇 가져오기
const { Client, Intents, MessageEmbed } = require("discord.js");
const { token, ad } = require('./config.json');
const fs = require('fs');

// 디스코드 봇 기본 세팅
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});
// 학교 세팅
const schoolFinder = (schoolName, region) => (schoolList) => {
    const targetSchool = schoolList.find((school) => {
        return school.region === region && school.name.includes(schoolName);
    });
    return targetSchool;
};

// 광고 수
const adCount = ad.length;
let userSettings = {};
const SETTINGS_FILE = './userSettings.json';

// 로그인 코드
client.login(token);
client.once('ready', () => {
    console.log("봇 온라인");
    loadSettings();
});


// 명령어가 보내졌을 때
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === '시간표') {
        try{
            GetSchedule(interaction);
        }
        catch (error){
            await SendMsg(error);
        }
    }
    if (commandName === '단축과목명'){
        try {
            ShortName(interaction);
        }
        catch (error){
            await SendMsg(""+error);
        }
    }
    if (commandName === '학년설정') {
        try {
            GradeSet(interaction);
        }
        catch (error){
            await SendMsg(error);
        }
    }
})

function GradeSet(interaction) {
    const grade = interaction.options.getInteger('학년');
    const classNum = interaction.options.getInteger('반');
    userSettings[interaction.user.id] = { grade: grade, class: classNum };
    saveSettings();
    console.log(`학년: ${grade}, 반: ${classNum}으로 설정되었습니다.`);
    interaction.reply(`학년: ${grade}, 반: ${classNum}으로 설정되었습니다.`);
}

/**
 * 시간표 불러오기
 * @param interaction interaction 넣기
 */
function GetSchedule(interaction){
    embed = new MessageEmbed()
    let grade = userSettings[interaction.user.id]?.grade;
    let classNum = userSettings[interaction.user.id]?.class;
    let day = GetDate(interaction);

    console.log("학년: " + grade + " 반: " + classNum + " 요일: " + change(day));
    let index = Math.floor(Math.random() * adCount);

    if (IsValidate(grade, classNum, day)){
        // 시간표 초기화
        timetable
            .init({ cache: 100 * 60 })
            .then(() => timetable.search('경기'))
            .then(schoolFinder('경기게임마이스터고등학교', '경기'))
            .then((school) => timetable.setSchool(school.code))
            .then(() => {
                Promise.all([timetable.getClassTime(), timetable.getTimetable()]).then((res) => {
                    // 시간표 목록 저장
                    let schedule = GetScheduleString(res, grade, classNum, day);

                    if (schedule === null || schedule === undefined) {
                        console.log("시간표 정보가 없습니다.");
                        interaction.reply('시간표 정보가 없습니다.')
                        return;
                    }

                    SendEmbed(grade, classNum, day, schedule, index, interaction);
                });
            });
    }
    else {
        console.log("학년, 반을 설정해주세요.");
        interaction.reply('학년, 반을 설정해주세요.');
    }
}

function SendEmbed(grade, classNum, day, schedule, index, interaction){
    // 시간표 임베드 형식으로 전송
    embed.setTitle(`${grade}학년 ${classNum}반 ${changeToString(day)}요일 시간표`)
        .setColor('FFFF77')
        .addFields({ name: '시간표', value: schedule })
        .setImage(ad[index])
        .setFooter({ text: '만든 사람: 이상규', iconURL: 'https://ifh.cc/g/4JHxDp.png' })
        .setThumbnail('https://ifh.cc/g/p3shNr.png')
        .setTimestamp()
    interaction.reply({ embeds: [embed] })
}

// 요일 문자로 바꾸기
function changeToString(c){
    if (c === 0)
        return "월";
    else if (c === 1)
        return "화";
    else if (c === 2)
        return "수";
    else if (c === 3)
        return "목";
    else if (c === 4)
        return "금";
}

// 요일 숫자로 바꾸기
function change(c){
    if (c === "월")
        return 0;
    else if (c === "화")
        return 1;
    else if (c === "수")
        return 2;
    else if (c === "목")
        return 3;
    else if (c === "금")
        return 4;
}


function ShortName(interaction){
     embed = new MessageEmbed()
        .setTitle('단축과목명')
        .setColor('FFFF77')
        .setImage('https://ifh.cc/g/Hadb74.png')
        .setFooter({ text: '만든 사람: 이상규', iconURL: 'https://ifh.cc/g/4JHxDp.png' })
        .setTimestamp()

    interaction.reply({ embeds: [embed] })
}

function MakeDate(interaction){
    let timestamp = interaction.createdTimestamp + 32400000;
    let date = new Date(timestamp);
    console.log(date);
    return date;
}

function IsValidate(grade, classNum, day){
    return grade >= 1 && grade <= 6 && classNum >= 1 && classNum <= 4 && day >= 0 && day <= 4;
}

function GetScheduleString(res, grade, classNum, day){
    let schedule = "";
    for (let i = 0; i < res[1][grade][classNum][day].length; i++) {
        schedule += res[0][i] + ": " + res[1][grade][classNum][day][i].subject + " (" + res[1][grade][classNum][day][i].teacher + ")\n\n";
    }
    console.log("시간표" + schedule);
    return schedule;
}

function saveSettings() {
    let data = JSON.stringify(userSettings, null, 2);
    fs.writeFileSync(SETTINGS_FILE, data);
    console.log("Settings saved");
    console.log(data);
}

function loadSettings() {
    if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE);
        userSettings = JSON.parse(data);
        console.log("Settings loaded");
        console.log(data);
    }
}

async function SendMsg(error){
    try {
        const user = await client.users.fetch("878836589755777066");
        await user.send(error);
        console.log("DM sent successfully");
    } catch (err) {
        console.error("Failed to send DM:", err);
    }
}

function GetDate(interaction){
    let date;
    if (interaction.options.getString('요일') == null || interaction.options.getString('요일') == undefined) {
        date = MakeDate(interaction).getDay();
        console.log(MakeDate(interaction));
        console.log("Make 요일: " + date);
    }
    else{
        date = change(interaction.options.getString('요일'));
        console.log("Get 요일: " + date);
    }

    return date;
}