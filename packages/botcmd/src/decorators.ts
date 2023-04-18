import type ICommandOptions from './types/command-options.interface';

const commandsSymbol = 'henta:botcmd:commands';
const commandViewMetadataSymbol = 'henta:botcmd:view';

export function getCommandViewMetadata(target): ICommandOptions {
  return Reflect.getMetadata(commandViewMetadataSymbol, target);
}

export function getCommands(
  target,
): { descriptor: PropertyDescriptor; options: ICommandOptions }[] {
  return Reflect.getMetadata(commandsSymbol, target);
}

export function applyBotcmdDecorator(cb) {
  return (target: any, propertyKey: string) => {
    const commandsObject = Reflect.getMetadata(commandsSymbol, target);
    if (!commandsObject?.[propertyKey]) {
      throw new Error('no command');
    }

    cb(commandsObject[propertyKey]);
    Reflect.defineMetadata(commandsSymbol, commandsObject, target);
  };
}

export function BotcmdCommand(options?: ICommandOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const commands = Reflect.getMetadata(commandsSymbol, target) || [];

    commands.push({
      descriptor,
      options: options || {},
    });

    Reflect.defineMetadata(commandsSymbol, commands, target);
  };
}

export function BotcmdView(options: ICommandOptions) {
  return (target: any) => {
    Reflect.defineMetadata(commandViewMetadataSymbol, options, target);
  };
}
