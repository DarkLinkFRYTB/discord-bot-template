/**
 * Import files and modules
 */

const Discord = require('discord.js');
const config = require('./config.json');
const commands = require('./commands.json');

/**
 * The Client class file
 */

module.exports.Client = class Client {
    /**
     * Create the class of client / bot
     * @param {String} token The client token in Discord Developper
     * @param {String} prefix The client prefix (the commands must start with that)
     * @param {Discord.ClientOptions} opts The client options
     */
    constructor(token = `${process.env.token}`, prefix = "!", opts = null) {
        this.token = token, this.prefix = prefix, (opts) ? this.client = new Discord.Client(opts): this.client = new Discord.Client(); //Set the client properties

        commands.forEach(c => {
            if(cmd.available === false) return;
            const cmd = require(c.path);
            cmd.setup(__dirname);
        });
    };
    
    /**
     * The login function
     * @param {String} message The message who will be log 
     */
    login(message = "Bot connected with identity \"" + this.client.user.tag + "\".") {
        try {
            this.client.login(this.token).catch(err => this.error(err, true)); //Connect the bot and catch an error if it happens
            this.client.on('ready', () => {
                console.log(message);
                config.mainGuilds.forEach(e => {
                    let channel = this.client.guilds.get(e).channels.find(c => c.name === "principal-logs");
                    if(!channel) return console.trace("The principal logs channel is unavailable in the guild \"" + this.client.guilds.get(g).name + "\".");;
                    channel.send({embed: {
                        title: "Bot connected",
                        description: message,
                        color: this.getDecimalColorByRGB(20, 255, 20)
                    }}).catch(err => this.error(err)); //Send the embed like what the bot is connected in the logs on principal guilds
                });
            });
            this.client.on("guildCreate", guild => {
                this.createLogs(guild.id);
            });
            this.client.on("message", message => {
                if(message.author.bot || !message.member) return;
                const args = message.content.trim().slice(this.prefix.length).split(/ +/), cmd = args.shift(), params = {
                    args: args,
                    message: message,
                    cmd: cmd,
                    method: "posted"
                };
                this.message(params);
                if(!message.content.trim().startsWith(this.prefix)) return;
                this.cmdHandler(params);
            });
        } catch(err) {
            this.error(err);
        };

        this.client.on("messageDelete", message => {
            let params = {
                message: message,
                method: "deleted"
            };
            this.message(params);
        });

        this.client.on("messageUpdate", (oldMessage, newMessage) => {
            let params = {
                message: newMessage,
                oldMessage: oldMessage,
                method: "edited"
            };
            this.message(params);
        });
    };

    /**
     * A function for choose embed color by RGB values
     * @param {Number} R The red value between 0 and 255
     * @param {Number} G The green value between 0 and 255
     * @param {Number} B The blue value between 0 and 255
     */
    getDecimalColorByRGB(R = 255, G = 255, B = 255) {
        if(R > 255 || R < 0 || G > 255 || G < 0 || B > 255 || B < 0) return console.trace("All arguments must be between 0 and 255");
        return (R * (256 ^ 0)) + (G *  (256 ^ 1)) + (B * (256 ^ 2));
    };

    /**
     * The command handler function
     * @param {Object} params The parameters for command handler (Here : message, args and cmd)
     */
    cmdHandler(params) {
        try {
            let cmd = commands.find(c => c.uses.toLowerCase().includes(params.cmd.toLowerCase()));
            if(!cmd) return params.message.channel.send("Unknown command");
            let canRun = false;
            if(cmd.roles) {
                cmd.roles.forEach(r => {
                    if(params.message.member.roles.find(role => role.id === r)) canRun = true;
                });
            } else {
                canRun = true;
            };
            if(!canRun) return params.message.channel.send("You don't have the permission to run this command");
            canRun = false;
            if(cmd.available === null) {
                cmd.canUse.forEach(r => {
                    if(params.message.member.roles.find(r)) canRun = true;
                });
            } else if(cmd.available) canRun = true;
            if(!canRun) return params.message.channel.send("This command is unavailable or in test.");
            params.client = this;
            let command = require(cmd.path);
            command.run(params);
        } catch(err) {
            this.error(err);
        };
    };

    /**
     * Logs functions
     */

        /**
         * The function for create the logs channels on a guild
         * @param {String | Number} guildID The guild id where create logs channels
         */
        createLogs(guildID) {
            try {
                let principal = (config.mainGuilds.find(e => e === guildID)) ? true: false;
                let guild = this.client.guilds.get(guildID)
                if(!guild.available) return console.trace("Guild unavailable");
                guild.createChannel("\"" + this.client.user.username + "\"'s Logs", {type: "category"}).then(parentChannel => {
                    //Messages logs channel
                    guild.createChannel("message-logs", {type: "text", parent: parentChannel}).then(c => {
                        c.send("Please, don't delete and don't rename this channel, and make sure I have the permission to read and write here. By default, only admin can view this channel").pin()
                        c.overwritePermissions("everyone", {VIEW_CHANNEL: false})
                    }).catch(err => this.error(err));

                    //Commands logs channel
                    guild.createChannel("commands-logs", {type: "text", parent: parentChannel}).then(c => {
                        c.send("Please, don't delete and don't rename this channel, and make sure I have the permission to read and write here. By default, only admin can view this channel").pin()
                        c.overwritePermissions("everyone", {VIEW_CHANNEL: false})
                    }).catch(err => this.error(err));

                    //If principal is true, create principal logs
                    if(principal) guild.createChannel("principal-logs", {type: "text", parent: parentChannel}).then(c => {
                        c.send("Please, don't delete and don't rename this channel, and make sure I have the permission to read and write here. By default, only admin can view this channel").pin()
                        c.overwritePermissions("everyone", {VIEW_CHANNEL: false})
                    }).catch(err => this.error(err));
                }).catch(err => this.error(err));
            } catch (err) {
                this.error(err);
            };
        };
    
        /**
         * The function who will be execute when an error will be encontered
         * @param {Error} err The error who was encontered
         * @param {Boolean} login The error was encontered in login function ?
         */
        error(err = new Error("Unspecified"), login = false) {
            try {
                console.trace(err);
                let errMessage = new String(err).trim().slice(7).trim();
                if (!login) delete this;
                else config.mainGuilds.forEach(g => {
                    let channel = this.client.guilds.get(g).channels.find(c => c.name === "principal-logs");
                    if (!channel) return console.trace("The principal logs channel is unavailable in the guild \"" + this.client.guilds.get(g).name + "\".");
                    channel.send({embed: {
                        title: "An error was encontered",
                        description: "Error message: " + (errMessage ? errMessage: "Unspecified") + ". In login: " + login,
                        color: this.getDecimalColorByRGB(255, 100, 100)
                    }}).catch(err => console.error(err));
                });
            } catch (err) {
                console.error(err);
            };
        };

        /**
         * The messages log function
         * @param {Object} params The parameter(s) for function (Here : message and method (posted, deleted or edited))
         */
        async message(params) {
            try {
                let channel = this.client.guilds.get(params.message.guild.id).channels.find(c => c.name === "message-logs");
                if(!channel) return;
                switch (params.method.toLowerCase()) {
                    case "posted":
                        channel.send({embed: {
                            title: "Message posted",
                            description: params.message.content,
                            author: {
                                icon_url: params.message.author.avatarURL,
                                name: params.message.author
                            },
                            color: this.getDecimalColorByRGB(100, 255, 100)
                        }});
                        break;
                
                    case "deleted":
                        let logs = await params.message.guild.fetchAuditLogs({type: 72});
                        let entry = logs.entries.first();
                        channel.send({embed: {
                            title: "Message deleted by \"" + entry.executor + "\"",
                            description: params.message.content,
                            author: {
                                icon_url: params.message.author.avatarURL,
                                name: params.message.author
                            },
                            color: this.getDecimalColorByRGB(255, 100, 100)
                        }}).catch(err => this.error(err));
                        break;
                
                    case "edited":
                        channel.send({embed: {
                            title: "Message edited",
                            description: "Before : " + params.oldMessage.content + ";\nAfter : " + params.message.content,
                            author: {
                                icon_url: params.message.author.avatarURL,
                                name: params.message.author
                            },
                            color: this.getDecimalColorByRGB(255, 255, 100)
                        }}).catch(err => this.error(err));
                        break;
                            
                    default:
                        break;
                };
            } catch(err) {
                this.error(err);
            };
        };
};