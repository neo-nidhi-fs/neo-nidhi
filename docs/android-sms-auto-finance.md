# Android SMS auto-finance ingestion

This feature auto-reads finance-related SMS and creates income/expense entries when the user has personal finance enabled.

## Implemented in this repo

- API endpoint: `POST /api/user/finance/ingest-sms`
- Finance SMS parser: `src/lib/smsFinanceParser.ts`
- Native sync wrapper: `src/lib/native/sms.ts`
- Auto polling hook on dashboard: `src/hooks/useAutoSmsFinanceSync.ts`

## Android native plugin required

The JavaScript side expects a Capacitor plugin named `SmsReader` with:

- `requestReadPermission(): { granted: boolean }`
- `readRecentMessages({ sinceEpochMs, limit }): { messages: NativeSmsMessage[] }`

`NativeSmsMessage` shape:

- `id: string`
- `sender: string`
- `body: string`
- `receivedAt: string` (ISO datetime)

## Android permissions

Add at least:

- `android.permission.READ_SMS`

Ask runtime permission before reading messages.

## Play Store policy warning

`READ_SMS` is a restricted permission on Google Play. Apps must qualify for permitted core use cases. If not eligible, distribute outside Play Store or use SMS forwarding APIs/user-consented alternatives.

## Flow summary

1. Native app reads recent SMS after permission.
2. Sends messages to `/api/user/finance/ingest-sms`.
3. Server parses finance SMS and inserts `CashFlow` rows.
4. Server skips duplicates using a message hash tag in note.
5. Sync cursor is stored on device to fetch only newer messages.
