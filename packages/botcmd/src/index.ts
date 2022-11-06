import PlatformContext from '@henta/core/context';
import requireArguments from './arguments/processor.js';

export interface Command {
  name: string;
  description?: string;
  handler: (ctx: PlatformContext) => Promise<void>;
  requires?: string[];
  // payload
  [key: string]: any;
}

/*
  Написал эти декораторы на коленке чтобы побыстрее затестить и уйти спать.
  Сейчас я пишу другой функционал, это вполне ноормальное явление, просто не завязывайтесь
  на локальном API, юзайте BotCmd.View и BotCmd.Command, а я позабочусь о их содержании..
*/

export class CommandView {
  botcmd: BotCmd;

  constructor(botcmd: BotCmd) {
    this.botcmd = botcmd;

    // todo: move to reflection
    this.$commands?.forEach(v => this.botcmd.add(buildCommand(v, this.constructor.$view, this)));
    this.botcmd.commands = this.botcmd.commands.sort((a, b) => b.name.length - a.name.length);
    // console.log(this.botcmd.commands.map(v => v.name));
  }
}

function buildCommand(command: Command, parent: Command, context: CommandView) {
  return {
    ...parent,
    ...command,
    view: parent.name,
    name: command.name ? `${parent.name} ${command.name}` : parent.name,
    handler: command.handler.bind(context)
  };
}

function checkCommand(command: Command, commandLine: string) {
  return command.name === commandLine || commandLine.startsWith(`${command.name} `);
}

export default class BotCmd {
  commands: Command[] = [];

  static View(options: Omit<Command, "handler">) {
    return function (target: any) {
      target.$view = options;
    };
  }

  // register command on view
  static Command(options?) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
      target.$commands = target.$commands || [];
      target.$commands.push({ ...(options || {}), handler: descriptor.value });
    };
  }

  add(command: Command) {
    this.commands.push(command);
  }

  async handler(ctx: PlatformContext, next) {
    if (ctx.isAnswered) {
      return next();
    }

    const commandLine = ctx.payload?.text || ctx.text?.trim();
    if (!commandLine) {
      return next();
    }

    ctx.commandLine = commandLine;
    const command = this.commands.find(item => checkCommand(item, commandLine.toLowerCase()));
    if (!command) {
      return next();
    }

    ctx.commandName = command.name;
    ctx.command = command;

    ctx.commandInput = {
      attachments: [],
      arguments: []
    };

    if (command.attachments) {
      ctx.commandInput.attachments = await ctx.requireAttachments(command.attachments);
    }

    if (command.arguments) {
      ctx.commandInput.arguments = await requireArguments(ctx, command.arguments);
    }

    await command.handler(ctx);
    return next();
  }
}