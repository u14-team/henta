import PlatformContext from '@henta/core/context';

export interface Command {
  name: string;
  handler: (ctx: PlatformContext) => Promise<void>;
}

export class CommandView {
  botcmd: BotCmd;

  constructor(botcmd: BotCmd) {
    this.botcmd = botcmd;

    console.log('$view', this.constructor);
    console.log('$commands', this.$commands);
    // todo: move to reflection
    this.$commands?.forEach(v => this.botcmd.add(buildCommand(v, this.constructor.$view)));
  }
}

function buildCommand(command: Command, parent: Command) {
  return {
    view: parent.name,
    name: command.name ? `${parent.name} ${command.name}` : parent.name,
    handler: command.handler
  };
}

function checkCommand(command: Command, commandLine: string) {
  return command.name === commandLine || command.name.startsWith(`${commandLine} `);
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
      target.$commands.push({ ...(options || {}), handler: descriptor.value.bind(target) });
    };
  }

  add(command: Command) {
    this.commands.push(command);
  }

  async handler(ctx: PlatformContext, next) {
    if (ctx.isAnswered) {
      return next();
    }

    const commandLine = /* ctx.payload?.text || */ ctx.text?.trim();
    if (!commandLine) {
      return next();
    }

    const command = this.commands.find(item => checkCommand(item, commandLine));
    if (!command) {
      return next();
    }

    await command.handler(ctx);
    return next();
  }
}