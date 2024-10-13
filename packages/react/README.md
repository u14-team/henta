# @henta/react

Experimental support for rendering messages from JS components using react
Use on prod at your own risk

Hooks will not work, as this package only renders JSX components.

## Example
```tsx
const UserEffects = () => {
  if (!ctx.user.effects.length) {
    return null;
  }

  return (<>
    ✨ Текущие эффекты:
    <List>
      {ctx.user.effects.map(effect => <UIEffect key={effect.id} effect={effect} />)}
    </List>
  </>);
};

ctx.answer(
  renderReact(
    <>
      <Body>
        <List>
          <>💳️ Баланс: <Amount value={ctx.user.balance} /></>
          {''}
          <>🏙️ Город: <City target={ctx.user} /></>
          <>🕛️ Время: {timeFromSeconds(worldEnvironmentService.timeOfDay)}</>
          <UserEffects />
        </List>
      </Body>
      <Keyboard>
        <KeyboardRow>
          <Button payload='профиль'>Профиль</Button>
        </KeyboardRow>
        <KeyboardRow>
          <Button payload='финансы'>Финансы</Button>
          <Button payload='помощь'>Помощь</Button>
        </KeyboardRow>
      </Keyboard>
    </>
  ),
);
```

