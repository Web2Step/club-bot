const Discord = require('discord.js');
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./config.json");
// config.prefix contains the message prefix.

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Янв','Фев','Мар','Апр','Май','Июнь','Июль','Авг','Сент','Окт','Нояб','Декабрь'];
    var year = a.getFullYear();
    //var month = months[a.getMonth()];
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    //var sec = a.getSeconds();
    var time = date + '.' + month + '.' + year + ' ' + hour + ':' + min;
    return time;
}

// ----------- FUNCTION ISARRAY --------------- //
isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};
// -------------------------------------------//

// ----------- FUNCTION ISJSON - НЕ ПАШЕТ КАК НАДО?!! --------------- //
function IsJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// ----------- FUNCTION ISJSON --------------- //


// ----------- FUNCTION BELT_Send ------------------------------- //
function Belt_Send(channel,info) {
    if (info === undefined) channel.send('Нет данных из источника.. [undefined] :confused:');
    else {
        const embed = new Discord.RichEmbed();
        //if (info.show_who !== false) embed.setAuthor(me + ' запрашивает..', avatar);
        if (info.author_name !== undefined && info.author_name !== null) embed.setAuthor(info.author_name, info.author_avatar);
        if (info.title !== undefined && info.title !== null) embed.setTitle(info.title);
        if (info.color !== undefined) embed.setColor(info.color);
        if (info.description !== undefined) embed.setDescription(info.description);
        if (info.footer !== undefined) embed.setFooter(info.footer, info.footer_icon);
        if (info.image !== undefined) embed.setImage(info.image);    //- ФОТКА НА ПОЛЭКРАНА!!!
        if (info.thumbnail !== undefined) embed.setThumbnail(info.thumbnail);
        if (info.timestamp !== undefined) embed.setTimestamp();
        if (info.url !== undefined) embed.setURL(info.url);

        // -------- СОЗДАТЬ СЕТКУ ЗНАЧЕНИЙ -------
        var fields = info.fields;
        if (isArray(fields)) fields.forEach(function (field) {
            if (field['insertline'] !== false) embed.addBlankField(field['insertline_group']);
            embed.addField(field['title'], field['value'], field['group']);
            //console.log(field);
        });
        // ----------------------------------------
        //client.channels.get(info.guild_channel).send({embed});
        channel.send({embed});
    }
}
// ----------------- FUNCTION BELT END ------------------------------ //

// ----------- FUNCTION TIMER1 ------------------------------- //
function checkTop1(guild, arg) {
    console.log('Checking '+guild.site+' / GID: '+arg+' ..');
    let timer_check_top1_file;
    //if (guild['timer_check_top1_file']>'') timer_check_top1_file = guild['timer_check_top1_file'];   else timer_check_top1_file = "showchannel_top1.php";
    let url = guild.site+'/api/discord-bot/'+guild.timer_check_top1_file+'?checkTop1Channel='+guild.timer_check_top1_channel+'&checkTop1Table='+guild.timer_check_top1_table+'&param=top1';
    global.getdata = 'Нет данных';
    console.log('URL TIMER: ' + url);

    const request = require('request');
    var baseRequest = request.defaults({
        pool: false,
        agent: false,
        jar: true,
        json: true,
        timeout: 5000,
        gzip: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    var options = {
        url: url,
        method: 'GET'
    };
    baseRequest(options, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            let infos =  body;
            console.log(body);
            if (!isArray(infos)) return;
            infos.forEach(function(info) {
                console.log('INFO: '+info);
                //var avatar = message.author.avatarURL;
                const embed = new Discord.RichEmbed();
                //if (info.show_who !== false) embed.setAuthor(me + ' запрашивает..', avatar);
                //else
                if (info.author_name !== undefined) embed.setAuthor(info.author_name, info.author_avatar);
                if (info.title !== undefined) embed.setTitle(info.title);
                if (info.color !== undefined) embed.setColor(info.color);
                if (info.description !== undefined) embed.setDescription(info.description);
                if (info.footer !== undefined) embed.setFooter(info.footer, info.footer_icon);
                if (info.image !== undefined) embed.setImage(info.image);    //- ФОТКА НА ПОЛЭКРАНА!!!
                if (info.thumbnail !== undefined) embed.setThumbnail(info.thumbnail);
                if (info.timestamp !== undefined) embed.setTimestamp();
                if (info.url !== undefined) embed.setURL(info.url);

                // -------- СОЗДАТЬ СЕТКУ ЗНАЧЕНИЙ -------
                var fields = info.fields;
                fields.forEach(function (field) {
                    if (field['insertline'] !== false) embed.addBlankField(field['insertline_group']);
                    embed.addField(field['title'], field['value'], field['group']);
                    //console.log(field);
                });
                // ----------------------------------------
                client.channels.get(info.guild_channel).send({embed});
            });
            //console.log(body);
        }
    });
}
// ----------------- FUNCTION TIMER1 END ------------------------------ //





client.on('ready', () => {
    console.log('I am ready!');
    //setInterval(checkTop1, config.timer_check_top1, 'top1');
    // Каждой гильдии свой таймер
    var guilds = config.guild;
    for (var key in guilds) {
        console.log('GID: '+key+' set interval..');
        setInterval(checkTop1, guilds[key]['timer_check_top1'], guilds[key], 'top1: '+key);
    };
});

client.on('message', message => {

    // --- Выйти если это не бот или не команда бота ---- //
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;
    // -------------------------------------------------- //

    if (message.content === '!ping') {
        message.reply('!pong');
    }


    // --- На каком сервере было сообщение ----------
    const guild_id = message.guild.id;
    const guild = config.guild[guild_id]; // взять настройки конкретного клуба

    // --- Аргументы и команды ----------
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // --- Какой ник взять -----------
    var nick_serv = message.author.username;
    var nick_guild = message.guild.members.get(message.author.id).nickname;
    var nick = ''; // universal nick
    var me = nick_guild;
    var me_avatar =  message.author.avatarURL;
    if (nick_guild === null) {
        nick = nick_serv; me = nick_serv;
    } else nick = nick_guild;
    var nick_url = encodeURI(nick);
    var param_str = args.join(" ").trim();

    // ------------- FORCE COMMAND BEGIN ----------------- //
    if (command === 'force') {
        checkTop1('top1',guild.timer_check_top1_channel);
    }
    // ------------- FORCE COMMAND END ----------------- //


    // ------------------- START !META ----------------------
    else if (command === 'meta' || command === 'мета') {
        //var param_send = null;
        var param_send = 'source='+args[0];
        //if ((command === 'bad') || (command === 'best')) param_send=args[1]; else param_send=args[0];
        //if  (param_send === null) param_send=0;
        //console.log('0-'+args[0]+'1-'+args[1]);

        var url = '';
        //if (((command==='bad')&&(args[0]==='season')) || (command==='badseason')) url = config.guild_site+'/api/discord-bot/getbadseason.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        //else if (((command==='bad')&&(args[0]==='step')) || (command==='badstep')) url = config.guild_site+'/api/discord-bot/getbadstep.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        url='http://cp.lol-info.ru/meta.php?'+param_send+'&json=true&mingames=250';
        console.log('URL META: ' + url);

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };
        baseRequest(options, function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var info =  body; // из тега БАДИ взять инфу
                console.log('BODY JSON: '+info);
                let channel_belt = message.channel; // вывести туда откуда запросили
                //if (command === 'tournament') channel_belt= message.guild.channels.get(config.guild_main_channel); // вывести на главный канал
                Belt_Send(channel_belt,info);
                console.log(info);
            }
        });
    }
    // ---------------- END !META --------------------------- //

    // ------------------- START !COUNTERPICK ----------------------
    else if (command === 'контрапик' || command === 'counterpick' || command === 'кп' || command === 'cp') {
        var param_send = 'champion='+encodeURI(args[0])+'&source='+encodeURI(args[1])+'&line='+encodeURI(args[2]);
        //if ((command === 'bad') || (command === 'best')) param_send=args[1]; else param_send=args[0];
        var url = '';
        //if (((command==='bad')&&(args[0]==='season')) || (command==='badseason')) url = config.guild_site+'/api/discord-bot/getbadseason.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        //else if (((command==='bad')&&(args[0]==='step')) || (command==='badstep')) url = config.guild_site+'/api/discord-bot/getbadstep.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        url='http://cp.lol-info.ru/index.php?'+param_send+'&json=true&mingames=250';
        console.log('URL COUNTERPICK: ' + url);

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };
        baseRequest(options, function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var info =  body; // из тега БАДИ взять инфу
                console.log('BODY JSON: '+info);
                let channel_belt = message.channel; // вывести туда откуда запросили
                //if (command === 'tournament') channel_belt= message.guild.channels.get(config.guild_main_channel); // вывести на главный канал
                Belt_Send(channel_belt,info);
                console.log(info);
            }
        });
    }
    // ---------------- END !COUNTERPICK --------------------------- //


    // ------------- FARM COMMAND BEGIN ----------------- //
    else if (command === 'farm' || command === 'club' || command === 'stat') {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }
        // --------
        let nick2 = param_str;
        if (nick2.length > 2) {
            nick_url=encodeURI(nick2);
            nick = nick2;
        }
        var url = guild['site']+'/api/discord-bot/getfarm.php?name='+nick_url+'&param='+args[0];
        global.getdata = 'Нет данных';

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };

        baseRequest(options, function(error, response, body) {
            if (error) {
                console.log(error);
                if (error == 'ESOCKETTIMEDOUT') message.reply(', попробуй чуть позже.. Проблемка! :robot:');
                else message.reply(', у меня траблы!.. ['+error+'] :robot:');
            } else {
                console.log('GET URL FARM: '+url);
                var info =  body;
                if (typeof info == 'object') { } else { message.reply(' Игрока **' + nick + '** нет в Клубе!? :thinking:'); console.log('Error URL: '+url); console.log('Error TEXT: '+info); return; }
                var icon = 'http://ddragon.leagueoflegends.com/cdn/'+info.apiImageVersion+'/img/profileicon/'+info.profileIconId+'.png';
                var avatar = message.author.avatarURL;
                var roles = info.roles;
                if (roles===null)  roles='нет';
                var active = info.active;
                if (active)  active='В клубе';
                else active='Не в клубе';
                console.log('Farm Name: '+info.name);
                // БАГ без имени?
                if (info.name === undefined) { message.reply('Ошибка доступа.. попробуйте позднее'); console.log('Error URL: '+url); return; }

                const embed = new Discord.RichEmbed()
                    .setTitle("Профиль игрока: "+info.name.toUpperCase())
                    .setAuthor(me + ' запрашивает..', avatar)
                    .setColor(0x00AE86)
                    .setDescription("Клубные характеристики игрока")
                    .setFooter(guild.footer_text, guild.footer_logo)
                    //.setImage(mainpic)    //- ФОТКА НА ПОЛЭКРАНА!!!
                    .setThumbnail(icon)
                    .setTimestamp()
                    .setURL(info.club_site+"/u/"+encodeURI(info.name))
                    .addField("Дата регистрации:", timeConverter(+info.gi_firstgame + 10800), true)
                    .addField("Дата игры:", timeConverter(+info.gi_lastgame + 10800), true)
                    .addField("Фарм Сезона:", info.gi_pointsAll, true)
                    .addField("Фарм Этапа", info.gi_pointsStep,true)
                    .addField("Игры Сезона:", info.gi_gamesSeason, true)
                    .addField("Игры Этапа", info.gi_gamesStep,true)
                    .addField("Роли:", info.roles_favorite_shortcode, true)
                    .addField("Чемпионы", info.champions_favorite,true)
                    .addField("WinRate Season:", info.gi_winrate+'%', true)
                    .addField("WinRate Step:", info.gi_winrateStep+'%', true)
                    .addField("Ранг игрока:", info.solo_tier+' '+info.solo_rank, true)
                    .addField("Серия побед:", info.gi_winstreakSeason, true)
                //.addField("Статус:", active, true)


                if (command === 'club' || command === 'stat') {
                    embed.setImage(info.main_image);
                    embed.addField("Пентакилл:", info.gi_pentaKills, true)
                }

                embed.addField(":star2:Достижения:", roles, false);

                if (info.relevant<10) {
                    var str2 = '' + message.author.username + ' - Игрока **' + nick + '** нет в Клубе! :thinking:';
                    message.channel.send(str2);
                }
                else message.channel.send({embed});
                console.log(body);
            }
        });
    }
    // END !FARM

    // START !BEST
    else if ((command === 'best' || command === 'BEST') && (args[0] === undefined)) {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }

        let nick2 = param_str;
        if (nick2.length > 2) {
            nick_url=encodeURI(nick2);
            nick = nick2;
        }
        var url = guild['site']+'/api/discord-bot/getbest.php?name='+nick_url;
        global.getdata = 'Нет данных';

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };

        baseRequest(options, function(error, response, body) {

            if (error) {
                console.log(error);
            } else {
                var info =  body;
                //var icon = 'http://smiles.lol-info.ru/aces.png';
                var avatar = message.author.avatarURL;
                const embed = new Discord.RichEmbed()
                    .setTitle('Лучшие игроки клуба "'+info.club_name.toUpperCase()+'"')
                    .setAuthor(me + ' запрашивает..', avatar)
                    .setColor(0x00CE26)
                    .setDescription("Статистика обновляется не моментально!")
                    .setFooter(info.footer, info.footer_icon)
                    //.setImage(mainpic)    //- ФОТКА НА ПОЛЭКРАНА!!!
                    .setThumbnail(info.thumbnail)
                    .setTimestamp()
                    .setURL(info.club_site+'/season')
                    .addField(":boom:Лучшие игроки Сезона:",  info.best_season, true)
                    .addBlankField(false)
                    .addField(":boom:Лучшие игроки Этапа:", info.best_step, true)
                    .addBlankField(true)
                    .addField(":boom:Лучшие игроки Дня:", info.best_today, true)
                message.channel.send({embed});
                console.log(body);
            }
        });
    }
// END !BEST

// START !BAD
    else if ((command === 'bad' || command === 'BAD') && (args[0] === undefined)) {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }

        let nick2 = param_str;
        if (nick2.length > 2) {
            nick_url=encodeURI(nick2);
            nick = nick2;
        }
        var url = guild['site']+'/api/discord-bot/getbad.php?name='+nick_url;
        global.getdata = 'Нет данных';

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };

        baseRequest(options, function(error, response, body) {

            if (error) {
                console.log(error);
            } else {
                var info =  body;
                //var icon = 'http://smiles.lol-info.ru/aces.png';
                var avatar = message.author.avatarURL;
                const embed = new Discord.RichEmbed()
                    .setTitle('Худшие игроки клуба "'+info.club_name.toUpperCase()+'"')
                    .setAuthor(me + ' запрашивает..', avatar)
                    .setColor(0x00CE26)
                    .setDescription("Статистика обновляется не моментально!")
                    .setFooter(info.footer, info.footer_icon)
                    //.setImage(mainpic)    //- ФОТКА НА ПОЛЭКРАНА!!!
                    .setThumbnail(info.thumbnail)
                    .setTimestamp()
                    .setURL(info.club_site+'/season')
                    .addField(":fire:Худшие игроки Сезона:",  info.bad_season, true)
                    .addBlankField(false)
                    .addField(":fire:Худшие игроки Этапа:", info.bad_step, true)
                    .addBlankField(true)
                    .addField(":fire:Худшие игроки Дня:", info.bad_today, true)

                message.channel.send({embed});
                console.log(body);
            }
        });
    }
// END !BAD


// START !BAD SEASON OR STEP
    else if (((command === 'bad' || command === 'best') && (args[0] === 'season' || args[0] === 'step')) || (command === 'badseason' || command === 'badstep' || command === 'beststep' || command === 'bestseason')) {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }

        var param_send = null;
        if ((command === 'bad') || (command === 'best')) param_send=args[1]; else param_send=args[0];
        if  (param_send === null) param_send=0;
        //console.log('0-'+args[0]+'1-'+args[1]);

        var url = '';
        if (((command==='bad')&&(args[0]==='season')) || (command==='badseason')) url = guild['site']+'/api/discord-bot/getbadseason.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        else if (((command==='bad')&&(args[0]==='step')) || (command==='badstep')) url = guild['site']+'/api/discord-bot/getbadstep.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        else if (((command==='best')&&(args[0]==='step')) || (command==='beststep')) url = guild['site']+'/api/discord-bot/getbeststep.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        else if (((command==='best')&&(args[0]==='season')) || (command==='bestseason')) url = guild['site']+'/api/discord-bot/getbestseason.php?name='+nick_url+'&stage='+args[0]+'&param='+param_send;
        global.getdata = 'Нет данных';
        console.log('URL: ' + url);

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };
        baseRequest(options, function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var info =  body;
                var avatar = message.author.avatarURL;
                const embed = new Discord.RichEmbed();
                if (info.show_who !== false) embed.setAuthor(me + ' запрашивает..', avatar);
                else embed.setAuthor(info.author_name, info.author_avatar);
                if (info.title !== undefined) embed.setTitle(info.title);
                if (info.color !== undefined) embed.setColor(info.color);
                if (info.description !== undefined) embed.setDescription(info.description);
                if (info.footer !== undefined) embed.setFooter(info.footer, info.footer_icon);
                if (info.image !== undefined) embed.setImage(info.image);    //- ФОТКА НА ПОЛЭКРАНА!!!
                if (info.thumbnail !== undefined) embed.setThumbnail(info.thumbnail);
                if (info.timestamp !== undefined) embed.setTimestamp();
                if (info.url !== undefined) embed.setURL(info.url);

                // -------- СОЗДАТЬ СЕТКУ ЗНАЧЕНИЙ -------
                var fields = info.fields;
                fields.forEach(function(field) {
                    if (field['insertline'] !== false) embed.addBlankField(field['insertline_group']);
                    embed.addField(field['title'], field['value'], field['group']);
                    //console.log(field);
                });
                // ----------------------------------------
                message.channel.send({embed});
                console.log(body);
            }
        });
    }
// END !BAD SEASON OR STEP

// START !RATING
    else	if (command === 'rating' || command === 'RATING') {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }

        var nick = message.guild.members.get(message.author.id).nickname;
        var me = message.guild.members.get(message.author.id).nickname;
        var params_url = encodeURI(param_str);
        if (param_str.length > 2) {
            params=encodeURI(nick);
        }
        var url = guild['site']+'/api/discord-bot/getrating.php?name='+nick_url+'&param2='+params_url;
        global.getdata = 'Нет данных';

        const request = require('request');
        var baseRequest = request.defaults({
            pool: false,
            agent: false,
            jar: true,
            json: true,
            timeout: 5000,
            gzip: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        var options = {
            url: url,
            method: 'GET'
        };

        baseRequest(options, function(error, response, body) {
            if (error) {
                console.log(error);
            } else {
                var info =  body;
                console.log(body);
                var icon = guild.guild_logo;
                var avatar = message.author.avatarURL;

                const embed = new Discord.RichEmbed()
                    .setTitle('Статистика Клубов Сезона')
                    .setAuthor(me + ' запрашивает..', avatar)
                    .setColor(0x00CE26)
                    .setDescription("Статистика по клубам!")
                    .setFooter(guild.footer_text, guild.footer_logo)
                    //.setImage(mainpic)    //- ФОТКА НА ПОЛЭКРАНА!!!
                    .setThumbnail(icon)
                    .setTimestamp()
                    .setURL('https://clubs.ru.leagueoflegends.com/rating');
                embed.addField("Название клуба №"+info.results[0].rank+'', info.results[0].club.lol_name,true);
                embed.addField("Глава клуба:", info.results[0].club.owner.summoner_name,true);
                embed.addField("Число игроков:", info.results[0].club.members_count,true);
                embed.addField("Сезоны клуба:", info.results[0].club.seasons_count,true);
                embed.addField("Очки клуба:", info.results[0].points,true);
                embed.addField("Игры клуба:", info.results[0].games,true);
                //embed.addField("Завершенные Этапы:", info.results[0].completed_stages,true);
                //embed.addField("Ранг:", info.results[0].rank,true);
                embed.addField("Дата вступления:", info.results[0].joined,false);
                embed.addBlankField(false);
                embed.addField("Название клуба №"+info.results[1].rank+'', info.results[1].club.lol_name,true);
                embed.addField("Глава клуба:", info.results[1].club.owner.summoner_name,true);
                embed.addField("Число игроков:", info.results[1].club.members_count,true);
                embed.addField("Сезоны клуба:", info.results[1].club.seasons_count,true);
                embed.addField("Очки клуба:", info.results[1].points,true);
                embed.addField("Игры клуба:", info.results[1].games,true);
                //embed.addField("Завершенные Этапы:", info.results[1].completed_stages,true);
                //embed.addField("Ранг:", info.results[1].rank,true);
                embed.addField("Дата вступления:", info.results[1].joined,false);

                embed.addBlankField(false);

                embed.addField("Название клуба №"+info.results[2].rank+'', info.results[2].club.lol_name,true);
                embed.addField("Глава клуба:", info.results[2].club.owner.summoner_name,true);
                embed.addField("Число игроков:", info.results[2].club.members_count,true);
                embed.addField("Сезоны клуба:", info.results[2].club.seasons_count+9,true);
                embed.addField("Очки клуба:", info.results[2].points,true);
                embed.addField("Игры клуба:", info.results[2].games,true);
                //embed.addField("Завершенные Этапы:", info.results[2].completed_stages,true);
                //embed.addField("Ранг:", info.results[2].rank,true);
                embed.addField("Дата вступления:", info.results[2].joined,true);
                /*
                 embed.addBlankField(true);

                embed.addField("Название клуба:", info.results[3].club.lol_name,true);
                embed.addField("Глава клуба:", info.results[3].club.owner.summoner_name,true);
                    embed.addField("Число игроков:", info.results[3].club.members_count,true);
                embed.addField("Сезоны клуба:", info.results[3].club.seasons_count,true);
                embed.addField("Очки клуба:", info.results[3].points,true);
                embed.addField("Игры клуба:", info.results[3].games,true);
                //embed.addField("Завершенные Этапы:", info.results[3].completed_stages,true);
                    embed.addField("Ранг:", info.results[3].rank,true);
                embed.addField("Дата вступления:", info.results[3].joined,true);
                */

                message.channel.send({embed});
                console.log(body);
            }
        });
    }
// END !RATING

// START !TOPIC
    else if (command === 'topic' || command === 'топик') {
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }
        message.channel.send(nick+', Топик ДНЯ:\r\n'+guild['site_pub']+'/topic/'+Date.now()+'/api/vk-bot/cover/tmp.png');
        console.log('поиск топика запущен..');
    }
// END !TOPIC


// START !INVITE
    else if (command === 'invite' || command === 'INVITE') {
        var nick = message.guild.members.get(message.author.id).nickname;
        var me = message.guild.members.get(message.author.id).nickname;
        var nick_url = encodeURI(nick);
        //const args = message.content.trim().split(/ +/g);
        //const command = args.toLowerCase();
        let nick2 = args.join(" ").trim();
        if (nick2.length > 2) {
            nick_url=encodeURI(nick2);
            nick = nick2;
        }

        if(message.member.roles.some(r=>["Клуб", "Mod", "Server Staff", "Proficient"].includes(r.name)) ) {
            var Role=message.guild.roles.find('name',config.chan_invite);
            // message.channel.send(Role.name); return;
            if (Role.id) message.guild.members.get(message.author.id).addRole(Role); else message.channel.send('HAVENT ROLE!');
            message.channel.send(nick+' допущен и ждёт!');
            return;
        } else {
            message.channel.send(nick+' не допущен!');
            return;
        }

        message.channel.send(nick+' в поиске стака!');
        console.log('поиск стака запущен..');
    }
// END !INVITE

// START !СОСТАВ турнира
    else if ((command === 'состав' && args[0] === 'турнир') || (command === 'tournament')){
        // ----- Конфиг сервера команды отсутствует ?! --------
        if (guild == undefined) { console.log('Guild not in config!: '+guild); message.reply(config.error['guild_command']); return; }
        let role_name = guild.tournament_role;
        let role_find = message.guild.roles.find("name", role_name);
        //console.log(role_find);
        if (role_find !== null) {
            var role_members = message.guild.roles.get(role_find.id).members;
            //console.log(role_members);
            //if (!isArray(role_members)) return;
            var members = []; var $members_count=0;
            role_members.forEach(function(role_member) {
                var guild_member=role_member;
                $members_count=$members_count + 1;
                //console.log(guild_member+' ###');
                if (guild_member.nickname === null) members.push(guild_member.user.username); else members.push(guild_member.nickname);
            });
            //message.channel.send('Состав "'+config.guild_tournament_role+'" '+ role_members.length+' чел.: ' + members.join(', '));
            let  info = {};
            info.author_name=null; info.title='Состав "'+guild.tournament_role+'" ['+ $members_count + ' чел.]'; info.color='#B6DB43'; info.description="``"+members.join(', ')+"``";
            info.footer='Турниры клуба'; info.footer_icon=guild.logo;
            info.image=null;    //- ФОТКА НА ПОЛЭКРАНА!!!
            info.thumbnail='http://lol-info.ru/images/bots/aces/tournament.png'; info.timestamp=true; info.url=null;
            info.fields=[]; // field['title'], field['value'], field['group'], field['insertline']
            //client.channels.get(info.guild_channel).send({embed});
            let channel_belt = message.channel; // вывести туда откуда запросили
            if (command === 'tournament') channel_belt= message.guild.channels.get(guild['main_channel']); // вывести на главный канал
            Belt_Send(channel_belt,info);
            //channel.send({embed});
        }
        else message.channel.send('Роли '+guild.tournament_role+' не существует!');
    }
// END !СОСТАВ

});

// THIS  MUST  BE  THIS  WAY
client.login(process.env.BOT_TOKEN);
