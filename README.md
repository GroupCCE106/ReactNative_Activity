# Mang Takyu SmartStaff (Expo / React Native)

A mobile companion app for a single Mang Takyu Fried Chicken branch, built to match the
project brief: role-based staff/manager access, a 12-minute frying timer, stock-count
threshold alerts, one-tap attendance, and a manager sales dashboard.

## Run it

1. Install [Node.js](https://nodejs.org) (LTS) and the Expo Go app on your phone.
2. In this folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `w` to
   run it in a browser, `a` for an Android emulator, `i` for an iOS simulator.

## Demo accounts

| Role    | Employee ID | Password    |
|---------|-------------|-------------|
| Staff   | STF001      | staff123    |
| Staff   | STF002      | staff123    |
| Manager | MGR001      | manager123  |

## What's implemented

| Screen             | Matches slide spec                                              |
|--------------------|-------------------------------------------------------------------|
| Login              | Employee ID + password, role read from account                   |
| Staff Home         | Quick-access cards: active timers, orders, stock alerts           |
| Cashier POS        | Quick-tap menu, live cart total, completes order                  |
| Kitchen Timer      | 12-minute countdown per batch, auto-flips to "ready", Notify Team  |
| Stock Count        | Numeric-only entry, auto low-stock flag vs. threshold              |
| Attendance         | One-tap check-in/out, on-time/late vs. shift start                |
| Manager Dashboard  | Sales-by-shift chart, late arrivals, low-stock list (manager-only) |

**Role-based access (RBAC):** Staff/Cashier accounts only ever see the Staff stack
(POS, Timer, Stock, Attendance). Manager accounts land directly on the Dashboard and
have no access to the POS/stock-entry screens — this is enforced in
`src/navigation/AppNavigator.js`.

## About data storage

The slide deck calls for **Firebase Firestore** for live sync plus local storage as an
offline fallback for attendance. I couldn't provision and wire up a real Firebase
project on your behalf (no credentials, and this environment has no network access),
so this build simulates the same behavior with **`@react-native-async-storage/async-storage`**:

- All state (stock, timers, orders, attendance) lives in one context
  (`src/context/AppContext.js`) and is persisted to the device automatically —
  functionally identical to "local phone storage" fallback described in the deck.
- Every state-changing action (`completeOrder`, `startTimer`, `checkIn`, etc.) is
  already isolated into its own function, so swapping the AsyncStorage calls for
  Firestore `setDoc`/`onSnapshot` calls later is a drop-in change — the screens
  themselves won't need to change.

To wire up real Firebase for true multi-device real-time sync:
1. Create a Firebase project → enable Firestore.
2. `npm install firebase`
3. Replace the `AsyncStorage.getItem/setItem` calls in `AppContext.js` with
   Firestore `onSnapshot` (read) and `setDoc`/`updateDoc` (write) calls against a
   `branches/{branchId}` document.

## Project structure

```
App.js
src/
  context/AppContext.js       # all app data + actions (the "backend" simulation)
  navigation/AppNavigator.js  # role-gated stack navigator
  screens/
    LoginScreen.js
    StaffHomeScreen.js
    CashierPOSScreen.js
    KitchenTimerScreen.js
    StockCountScreen.js
    AttendanceScreen.js
    ManagerDashboardScreen.js
  theme/colors.js
```
