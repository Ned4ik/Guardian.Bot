//Imports
const {
    messageIssueRowsMap,
    messageBannedWordsMap,
    roleBlade
} = require('./bot_consts')
const {
    hasGuild,
    regexpOneRole
} = require('./regular_expression')
//

//Funtions
function checkMessage(arr) {
    return arr.length === 8
}
function checkMessageRow(row, pattern) {
    return pattern.test(row)
}

function checkIssueRow(row, index) {
    if (!messageIssueRowsMap[index]) return [];
    const errors = [];
    messageIssueRowsMap[index].forEach(object => {
        if (!checkMessageRow(row, object.regExp)) {
            errors.push(object.error);
        }
    })
    return errors;
}

function checkBannedWords(row, index) {
    if (!messageBannedWordsMap[index]) return [];
    const errors = [];
    messageBannedWordsMap[index].forEach(object => {
        if (checkMessageRow(row, object.regExp)) {
            errors.push(object.error);
        }
    })
    return errors;
}

function setUserNickname(message, arr) {
    //reg UserID
    const regUserID = / ([A-Z-a-z0-9.,$_]+)/g;
    //reg Name
    const regName = /([А-Яа-яё]+)/g;
    //parse userId & Name
    const userID = arr[1].match(regUserID);
    const name = arr[1].match(regName)
    const nickname = userID[1] + ' ' + '(' + name[0] + ')';
    message.member.setNickname(nickname);
}

function setGeneralRole(message, arr) {
    const roleBlade = message.guild.roles.cache.find(r => r.id === process.env.ROLE_GENERAL);
    const roleFriendly = message.guild.roles.cache.find(r => r.id === process.env.ROLE_FRIENDLY);
    if (hasGuild.test(arr[3])) {
        message.member.roles.add(roleBlade);
    } else {
        message.member.roles.add(roleFriendly);
    }
}

function setCharacterRole(message, arr) {
    //find role by id
    const roleTank = message.guild.roles.cache.find(r => r.id == process.env.ROLE_TANK);
    const roleHealer = message.guild.roles.cache.find(r => r.id == process.env.ROLE_HEALER);
    const roleDamager = message.guild.roles.cache.find(r => r.id == process.env.ROLE_DAMAGER);

    // send to const
    const rolesMap = {
        "Танк": roleTank,
        "Целитель": roleHealer,
        "Дамагер": roleDamager,
        "ДД": roleDamager,
        "Хил": roleHealer
    };

    [...arr[7].matchAll(regexpOneRole)].forEach((match) => {
        if (match[0]) {
            message.member.roles.add(rolesMap[match[0]]);
        }
    });

}

function sendErrorEmbed(errors, errorBanned, message, embed) {
    message.delete();
    message.author.send({ embeds: [embed.setDescription(errors.join("\n") + "\n" + errorBanned.join("\n"))] });
}

function sendMessageToArchive(channel, message) {
    const hasGeneralRole = message.member.roles.cache.has(process.env.ROLE_GENERAL);
    if (hasGeneralRole) {
        message.delete();
        channel.send(`${message.content}`);
    } else {
        message.delete();
        channel.send(`${message.content}\n <@&869209936830267392> Киньте приглашение в гильдию вот этой печеньке <@${message.author.id}>`);
    }
}

function giveAssistantRole(userMessage, role, message) {

    const userID = userMessage[1].split(/[<@>,]/);
    const user = message.guild.members.cache.find(user => user.id ===`${userID[2]}`);
    setTimeout(() =>{
        message.delete();
        user.roles.add(role);
        message.channel.send(`Роль ${role} успешно выдана участнику <@${userID[2]}>`);
    }, 2000)
    setTimeout(() => {
        const member = message.guild.members.cache.find(user => user.id ===`${userID[2]}`);
        member.roles.remove(role);
        message.channel.send(`Роль ${role} успешно убрана в участника <@${userID[2]}>`);
    }, 10800000)

}
//

//Exports
module.exports = {
    checkIssueRow,
    checkBannedWords,
    setUserNickname,
    setGeneralRole,
    setCharacterRole,
    checkMessage,
    sendErrorEmbed,
    sendMessageToArchive,
    giveAssistantRole
};
//