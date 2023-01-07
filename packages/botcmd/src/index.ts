import PlatformContext from '@henta/core/context';
import type BaseAttachmentHistory from '@henta/attachment-history';
import BotCmdContext from './botcmdContext.js';
import { getAttachmentRequests } from '@henta/input';
import { compose, Middleware } from 'middleware-io';
import IBotCmdOptions from './options.interface.js';
import { requestInputArgsMiddleware } from './middlewares.js';
import { applyBotcmdDecorator, BotCmdCommand, BotCmdView } from './decorators.js';

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
    buildedCommand._isAttachmentsDeprecated = true;
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
  private _composed: Middleware<PlatformContext>;

  constructor(public options: IBotCmdOptions = {}) {
    this.attachmentHistory = options.attachmentHistory;

    if (!this.options.middlewares) {
      this.options.middlewares = [
        requestInputArgsMiddleware
      ];
    }

    this._composed = compose(this.options.middlewares);
  }

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

      return BotCmdCommand(options)(target, propertyKey, descriptor);
    };
  }

  add(command: Command) {
    this.commands.push(command);
  }

  find(query: string): Command {
    const lowercase = query.toLowerCase();
    return this.commands.find(item => checkCommand(item, lowercase));
  }

  /** Middleware end */
  async execute(ctx: BotCmdContext) {
    if (!ctx.botcmdData) {
      throw new Error('BotCmd not found on context');
    }

    await ctx.botcmdData.command.handler(ctx, ...(ctx.botcmdData.args || []));
  }

  async handler(ctx: BotCmdContext, next) {
    if (ctx.isAnswered) {
      return next();
    }

    if (!ctx.commandLine) {
      return next();
    }

    const command = this.find(ctx.commandLine);
    if (!command) {
      return next();
    }

    ctx.commandLinePosition += command.name.length;
    ctx.botcmdData = {
      botcmd: this,
      commandLine: ctx.commandLine, // TODO: remove
      command,
    };

    await this._composed(ctx, () => this.execute(ctx));
    return next();
  }
}

export { BotCmdContext, BotCmdCommand, applyBotcmdDecorator, BotCmdView };
