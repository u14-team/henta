import type { Command } from '.';

const botcmdCommandsObjReflectSymbol = Symbol("botcmd_commands_obj");
// const botcmdCommandsReflectSymbol = Symbol("botcmd_commands");

export function applyBotcmdDecorator(cb) {
  return (target: any, propertyKey: string) => {
    const commandsObject = Reflect.getOwnMetadata(botcmdCommandsObjReflectSymbol, target);
    if (!commandsObject?.[propertyKey]) {
      throw new Error('no command');
    }

    cb(commandsObject[propertyKey]);
    Reflect.defineMetadata(
      botcmdCommandsObjReflectSymbol,
      commandsObject,
      target,
    );
  };
}

export function BotCmdCommand(options?) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const commandsObject = Reflect.getOwnMetadata(botcmdCommandsObjReflectSymbol, target) || {};
    commandsObject[propertyKey] = { ...(options || {}), handler: descriptor.value };

    Reflect.defineMetadata(
      botcmdCommandsObjReflectSymbol,
      commandsObject,
      target,
    );

    // TODO: remove this
    target.$commands = target.$commands || [];
    target.$commands.push(commandsObject[propertyKey]);
  }; 
}

export function BotCmdView(options: Omit<Command, "handler">) {
  return (target: any) => {
    target.$view = options; // TODO: make metadata
    target.$commands = target.$commands || [];
    // const commandsObject = Reflect.getOwnMetadata(botcmdCommandsObjReflectSymbol, target) || {};
    // TODO: remove bc
    // target.$commands = Object.values(commandsObject);
    // console.log('view', target)
  }; 
}