import type { PlatformContext } from '@henta/core';
import type { BotCmdContext, ICommandOptions } from '.';
import type { Middleware } from 'middleware-io';
import type BotcmdContainer from './container';
import { findOnContainers } from './utils';
import type IBuildedCommand from './types/builded-command.interface';
import { COMMAND_VIEW_METADATA, COMMAND_METADATA } from './consts';

export interface IBotCmdProcessorOptions {
  middleware: Middleware<PlatformContext>;
  containers: BotcmdContainer[];
}

export async function processBotcmd(
  ctx: BotCmdContext,
  next,
  options: IBotCmdProcessorOptions,
) {
  if (ctx.isAnswered || !ctx.commandLine) {
    return next();
  }

  const found = findOnContainers(ctx.commandLine, options.containers);
  if (!found) {
    return next();
  }

  ctx.commandLinePosition += found.pattern.length;
  await executeCommand(ctx, found.command, options.middleware);

  return next();
}

export async function executeCommand(
  ctx: BotCmdContext,
  command: IBuildedCommand,
  middleware: Middleware<PlatformContext>,
) {
  ctx.botcmdData = { command };
  await middleware(ctx, () => executeBotcmdContext(ctx));
}

export async function executeBotcmdContext(ctx: BotCmdContext) {
  if (!ctx.botcmdData) {
    throw new Error('BotCmd not found on context');
  }

  const args = ctx.botcmdData.args || [];
  await ctx.botcmdData.command.handler(ctx, ...args);
}

export function getCommandViewMetadata(target): ICommandOptions {
  return Reflect.getMetadata(COMMAND_VIEW_METADATA, target);
}

export function getCommands(
  target,
): { descriptor: PropertyDescriptor; options: ICommandOptions }[] {
  const prototype = Object.getPrototypeOf(target);
  const properties = Object.getOwnPropertyNames(prototype);

  const response = [];
  for (const key of properties) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    if (typeof descriptor.value !== 'function') {
      continue;
    }

    const options = Reflect.getMetadata(COMMAND_METADATA, descriptor.value);
    if (!options) {
      continue;
    }

    response.push({ descriptor, options });
  }

  return response;
}
