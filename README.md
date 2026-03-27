# Wordle Tournament (La Palabra del Dia)

App simple para competir entre amigos por semana:

- Cada jugador pega su resultado compartido (`La palabra del dia #1541 4/6 ...`).
- Se parsea automaticamente.
- Puntaje: `1 intento = 6`, `2 = 5`, ... `6 = 1`, `fallo = 0`.
- Se bloquean duplicados por `jugador + numero de palabra`.
- Se muestra tabla semanal con desempates.

## Ejecutar local

```bash
npm install
npm run dev
```

## Configuracion de jugadores

### Modo local

Para pruebas sin backend, la app usa `src/config/players.ts` como fallback local.

### Modo Google Sheets

Para no tocar la app al agregar o sacar jugadores, usa una pestaña `players` en la misma Sheet.

Columnas recomendadas:

`id, name, pin, active`

Ejemplo:

```ts
export const localPlayers = [
  { id: 'agus', name: 'Agus', pin: '1234' },
  { id: 'fede', name: 'Fede', pin: '5678' }
]
```

Con endpoint configurado, la app carga el selector de jugadores desde Google Sheets y el PIN se valida del lado de Apps Script al enviar el resultado.

## Persistencia

### Modo demo (sin backend)

Si no configuras endpoint, la app usa `localStorage` del navegador.

### Modo Google Sheets (recomendado)

1. Crea un Google Sheet con dos pestañas.

`players`

`id, name, pin, active`

`results`

`playerId, playerName, puzzleNumber, attempts, maxAttempts, solved, score, rawResult, playedOn, weekKey, submittedAt`

2. Crea un Google Apps Script como Web App y pega el contenido de [apps-script/Code.gs](apps-script/Code.gs).

3. El script expone estas acciones:

- `GET ?action=players`
- `GET ?action=leaderboard&week=YYYY-Www`
- `POST` con `{ action: 'submit', payload: SubmissionEntry, pin: '1234' }`

4. Despliega el Apps Script como Web App con acceso para quien vaya a usar la app.

5. En `.env` agrega:

```bash
VITE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/.../exec
```

6. Con eso ya podés administrar jugadores, PINs y activación directamente desde la hoja `players` sin redeploy de frontend.

## Empates en ranking

Orden de tabla:

1. Mayor puntaje total.
2. Mayor cantidad de aciertos.
3. Menor promedio de intentos.
4. Nombre alfabetico.
