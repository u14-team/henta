import PlatformContext from '@henta/core/context';
import type BaseAttachmentHistory from '@henta/attachment-history';
import requireArguments from './arguments/processor.js';
import BotCmdContext from './botcmdContext.js';
import { requireInputArgs, getAttachmentRequests } from '@henta/input';

export interface Command {
  name: string;
  description?: string;
  handler: (ctx: PlatformContext, ...args) => Promise<void>;
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
    this['$commands']?.forEach(v => this.botcmd.add(buildCommand(v, this.constructor['$view'], this)));
    this.botcmd.commands = this.botcmd.commands.sort((a, b) => b.name.length - a.name.length);
    // console.log(this.botcmd.commands.map(v => v.name));
  }
}

function buildCommand(command: Command, parent: Command, context: CommandView) {
  const name = command.name ? `${parent.name} ${command.name}` : parent.name;
  const buildedCommand = {
    ...parent,
    ...command,
    view: parent.name,
    name,
    context,
    originalFn: command.handler,
    handler: command.handler.bind(context)
  } as any;

  if (!buildedCommand.attachments) {
    buildedCommand.attachments = getAttachmentRequests(command.handler)?.map(v => v.request);
  } else {
    console.warn('deprecated attachments:', name);
  }

  return buildedCommand;
}

function checkCommand(command: Command, commandLine: string) {
  if (command.name === commandLine || commandLine.startsWith(`${command.name} `)) {
    return true;
  }

  const withoutSpaces = command.name.replace(/ /g, '');
  if (withoutSpaces === commandLine || commandLine.startsWith(`${withoutSpaces} `)) {
    return false;
  }

  return false;
}

export default class BotCmd {
  commands: Command[] = [];
  attachmentHistory?: BaseAttachmentHistory;

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

  find(query: string): Command {
    const lowercase = query.toLowerCase();
    return this.commands.find(item => checkCommand(item, lowercase));
  }

  async handler(ctx: BotCmdContext, next) {
    if (ctx.isAnswered) {
      return next();
    }

    const commandLine = ctx.payload?.text || ctx.text?.trim();
    if (!commandLine) {
      return next();
    }

    ctx.commandLine = commandLine;
    const command = this.find(commandLine);
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
      ctx.commandInput.attachments = await ctx.requireAttachments(
        command.attachments,
        // unstable, в планах вообще вынсти attachment requirer отдельно
        this.attachmentHistory
          ? await this.attachmentHistory.request(
              ctx.platform,
              ctx.peerId,
              command.attachments.length,
              command.attachments.map(v => v.type)
            ).catch(() => [])
          : []
      );
    }

    if (command.arguments) {
      ctx.commandInput.arguments = await requireArguments(ctx, command.arguments);
    }

    const args = await requireInputArgs(command.originalFn, ctx, this.attachmentHistory);
    await command.handler(ctx, ...args);
    return next();
  }
}

export { BotCmdContext };