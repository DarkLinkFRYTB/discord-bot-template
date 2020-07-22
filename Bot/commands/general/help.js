/**
 * The help command
 */

/**
 * The setup function
 * @param {String} dirname The Client class file directory name (__dirname)
 */
function setup(dirname = __dirname) {
    console.log((__filename.slice(dirname.length + 1)) + " file is ready.")
}

/**
  * The command function
  * @param {Object} params The parameter(s) for the function
  */
function run(params) {
    try {
        const commands = require('../../commands.json')
        let embed = {
            title: "Help menu",
            description: "It's the command list. All in [] is optional, || equal \"or\"",
            fields: []
        }
        commands.forEach(cmd => {
            let canRead = false;
            if(cmd.available === false) return;
            if(cmd.roles) {
                cmd.roles.forEach(r => {
                    if(params.message.member.roles.find(role => role.id === r)) canRead = true;
                });
            };
            if(cmd.available === null) {
                cmd.canUse.forEach(r => {
                    if(params.message.member.roles.find(role => role.id === r)) canRead = true;
                });
            };
            if(!canRead) return;
            embed.fields.push({name: '\u200B', value: '\u200B', inline: false});
            embed.fields.push({name: 'Name', value: cmd.name, inline: true});
            embed.fields.push({name: 'Desctiption', value: cmd.description, inline: true});
            embed.fields.push({name: 'Uses', value: cmd.helpMenuUses.join(" || "), inline: true});
        });
    } catch(err) {
        params.client.error(err);
    };
};

module.exports.setup = setup;
module.exports.run = run;