/**
 * The demonstration command (copy the setup and overwrite the run function)
 */

/**
 * The setup function
 * @param {String} dirname The Client class directory name (__dirname)
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
        let target = (params.message.mentions.members.first()) ? params.message.mentions.members.first(): params.message.author;
        params.message.channel.send("Hey " + target + ", it's the demonstration command");
    } catch(err) {
        params.client.error(err);
    };
};

module.exports.setup = setup;
module.exports.run = run;