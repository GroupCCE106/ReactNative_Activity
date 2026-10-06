import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, onSnapshot, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const STORAGE_KEY = "@mangtakyu_smartstaff_data_v1";
const BATCH_SECONDS = 12 * 60;

const MENU = [
  { id: "m1", name: "Original Chicken Bucket (6pc)", price: 349, usesChicken: 6 },
  { id: "m2", name: "2pc Chicken w/ Rice", price: 99, usesChicken: 2 },
  { id: "m3", name: "Chicken Sandwich", price: 69, usesChicken: 1 },
  { id: "m4", name: "Gravy Rice", price: 39, usesChicken: 0 },
  { id: "m5", name: "Iced Tea", price: 29, usesChicken: 0 },
  { id: "m6", name: "Fries", price: 49, usesChicken: 0 },
];

const INITIAL_STOCK = [
  { id: "i1", name: "Chicken Pieces", unit: "pcs", quantity: 120, threshold: 30 },
  { id: "i2", name: "Cooking Oil", unit: "L", quantity: 15, threshold: 5 },
  { id: "i3", name: "Flour Mix", unit: "kg", quantity: 20, threshold: 5 },
  { id: "i4", name: "Rice", unit: "kg", quantity: 25, threshold: 8 },
  { id: "i5", name: "Gravy Mix", unit: "packs", quantity: 10, threshold: 3 },
];

const DEFAULT_STATIONS = [
  { id: "s1", name: "Station 1 - Fryer" },
  { id: "s2", name: "Station 2 - Cashier" },
  { id: "s3", name: "Station 3 - Prep" },
  { id: "s4", name: "Station 4 - Packing" },
];

const defaultData = {
  stock: INITIAL_STOCK,
  orders: [],
};

const AppContext = createContext(null);

function mapFirestoreUser(firebaseUser, userDoc) {
  const data = userDoc.data() || {};
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: data.fullName || data.name || "User",
    role: data.role || "staff",
    assignedStation: data.assignedStation || null,
    shiftStart: data.shiftStart || "9:00 AM",
    shiftEnd: data.shiftEnd || "6:00 PM",
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(defaultData);
  const [timers, setTimers] = useState([]);
  const [stations, setStations] = useState(DEFAULT_STATIONS);
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const tickRef = useRef(null);

  // Load local persisted data
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setData(JSON.parse(raw));
      } catch (e) {
        console.warn("Failed to load stored data", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist local data
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) =>
      console.warn("Failed to persist data", e)
    );
  }, [data, loaded]);

  // ---------- Firebase Auto-Login ----------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(mapFirestoreUser(firebaseUser, userDoc));
          } else {
            setUser(null);
          }
        } catch (e) {
          console.warn("Failed to fetch user profile:", e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // ---------- 🔥 Real-time Timers from Firestore ----------
  useEffect(() => {
    if (!user) {
      setTimers([]);
      return;
    }
    const q = query(collection(db, "timers"), orderBy("startedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTimers(list);
    }, (err) => {
      console.warn("Timers listener error:", err);
    });
    return unsub;
  }, [user]);

  // ---------- 🔥 Real-time Stations from Firestore ----------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "stations"), (snap) => {
      if (snap.empty) {
        DEFAULT_STATIONS.forEach((s) => {
          setDoc(doc(db, "stations", s.id), { name: s.name, assignedTo: null, assignedName: null });
        });
        return;
      }
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStations(list);
    }, (err) => {
      console.warn("Stations listener error:", err);
    });
    return unsub;
  }, []);

  // ---------- 🔔 Real-time Notifications ----------
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Filter: broadcast (targetUid null) o para sa akoa
      const mine = list.filter(
        (n) => !n.targetUid || n.targetUid === user.uid
      );
      setNotifications(mine);
    }, (err) => console.warn("Notifications listener error:", err));
    return unsub;
  }, [user]);

  // Global 1s tick (para mo-trigger sa timer status check)
  const [, forceTick] = useState(0);
  useEffect(() => {
    tickRef.current = setInterval(() => {
      forceTick((n) => n + 1);
      // Auto-flip to "ready" kung tapos na ang 12-min + auto-notify
      timers.forEach(async (t) => {
        if (t.status === "active") {
          const elapsed = (Date.now() - t.startedAt) / 1000;
          if (elapsed >= t.durationSec && !t.notified) {
            try {
              await updateDoc(doc(db, "timers", t.id), {
                status: "ready",
                notified: true,
              });
              // 🔔 Auto-send notification sa tanan
              const nid = `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              await setDoc(doc(db, "notifications", nid), {
                title: "🍗 Chicken Batch Ready!",
                message: `${t.label} is ready to serve!`,
                type: "timer_ready",
                targetUid: null,
                from: t.startedBy || "System",
                fromUid: t.startedByUid || "system",
                createdAt: Date.now(),
                readBy: [],
              });
            } catch (e) {
              console.warn("Failed to mark timer ready:", e);
            }
          }
        }
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, [timers]);

  // ---------- Auth ----------
  const login = useCallback(async (email, password) => {
    if (!email || !password) return { ok: false, error: "Palihug butangi og email ug password." };
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (!userDoc.exists()) return { ok: false, error: "Walay user profile sa database." };
      const mapped = mapFirestoreUser(cred.user, userDoc);
      setUser(mapped);
      return { ok: true, user: mapped };
    } catch (err) {
      console.error("Login error:", err);
      let msg = "Sayop ang email o password.";
      if (err.code === "auth/invalid-email") msg = "Dili valid nga email.";
      if (err.code === "auth/user-not-found") msg = "Wala nakit-an ang account.";
      if (err.code === "auth/wrong-password") msg = "Sayop ang password.";
      if (err.code === "auth/invalid-credential") msg = "Sayop ang email o password.";
      return { ok: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await signOut(auth); } catch (e) { console.warn(e); }
    setUser(null);
  }, []);

  // ---------- 🔥 Kitchen Timer (Firestore-backed) ----------
  const startTimer = useCallback(async (label, stationId = null) => {
    if (!user) return;
    const timerId = `t${Date.now()}`;
    await setDoc(doc(db, "timers", timerId), {
      label: label || "Fresh Chicken Batch",
      startedAt: Date.now(),
      durationSec: BATCH_SECONDS,
      status: "active",
      startedBy: user.name,
      startedByUid: user.uid,
      stationId: stationId,
      notified: false,
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const dismissTimer = useCallback(async (id) => {
    try { await deleteDoc(doc(db, "timers", id)); } catch (e) { console.warn(e); }
  }, []);

  // ---------- 🔥 Stations (Manager only) ----------
  const assignStation = useCallback(async (stationId, staffUid, staffName) => {
    if (user?.role !== "manager") {
      return { ok: false, error: "Manager ra ang makabuhat niini." };
    }
    try {
      await updateDoc(doc(db, "stations", stationId), {
        assignedTo: staffUid,
        assignedName: staffName,
        assignedAt: serverTimestamp(),
        assignedBy: user.name,
      });
      await updateDoc(doc(db, "users", staffUid), { assignedStation: stationId });

      // 🔔 Notify sa staff
      const stationObj = stations.find(s => s.id === stationId);
      const stationName = stationObj ? stationObj.name : "usa ka station";
      const nid = `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      await setDoc(doc(db, "notifications", nid), {
        title: "📍 Station Assigned",
        message: `Gi-assign ka sa ${stationName}.`,
        type: "station_assigned",
        targetUid: staffUid,
        from: user.name,
        fromUid: user.uid,
        createdAt: Date.now(),
        readBy: [],
      });

      return { ok: true };
    } catch (e) {
      console.error(e);
      return { ok: false, error: e.message };
    }
  }, [user, stations]);

  // ---------- 🔔 Notifications ----------
  const sendNotification = useCallback(async (title, message, type = "general", targetUid = null) => {
    if (!user) return;
    const id = `n${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, "notifications", id), {
        title,
        message,
        type,
        targetUid,
        from: user.name,
        fromUid: user.uid,
        createdAt: Date.now(),
        readBy: [user.uid],
      });
    } catch (e) {
      console.error("sendNotification error:", e);
    }
  }, [user]);

  const markNotificationRead = useCallback(async (id) => {
    if (!user) return;
    try {
      const ref = doc(db, "notifications", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const readBy = snap.data().readBy || [];
      if (!readBy.includes(user.uid)) {
        await updateDoc(ref, { readBy: [...readBy, user.uid] });
      }
    } catch (e) {
      console.warn("markNotificationRead error:", e);
    }
  }, [user]);

  // ---------- 🔥 Real-time Attendance from Firestore ----------
useEffect(() => {
  if (!user) {
    setAttendance([]);
    return;
  }
  const q = query(collection(db, "attendance"), orderBy("checkIn", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setAttendance(list);
  }, (err) => {
    console.warn("Attendance listener error:", err);
  });
  return unsub;
}, [user]);

  // ---------- Stock ----------
  const updateStockQuantity = useCallback((ingredientId, newQuantity) => {
    setData((prev) => ({
      ...prev,
      stock: prev.stock.map((i) => i.id === ingredientId ? { ...i, quantity: newQuantity } : i),
    }));
  }, []);

  const deductStockForOrder = useCallback((cartItems) => {
    setData((prev) => {
      const chickenUsed = cartItems.reduce((sum, ci) => sum + ci.usesChicken * ci.qty, 0);
      return {
        ...prev,
        stock: prev.stock.map((i) => i.id === "i1" ? { ...i, quantity: Math.max(0, i.quantity - chickenUsed) } : i),
      };
    });
  }, []);

  // ---------- Orders ----------
  const completeOrder = useCallback((cartItems) => {
    const total = cartItems.reduce((sum, ci) => sum + ci.price * ci.qty, 0);
    const hasChicken = cartItems.some((ci) => ci.usesChicken > 0);
    const hour = new Date().getHours();
    const shift = hour < 14 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
    setData((prev) => ({
      ...prev,
      orders: [...prev.orders, {
        id: `o${Date.now()}`,
        items: cartItems.map((ci) => ({ name: ci.name, qty: ci.qty, price: ci.price })),
        total, timestamp: Date.now(), shift,
      }],
    }));
    deductStockForOrder(cartItems);
    if (hasChicken) startTimer("Fresh Chicken Batch");
  }, [deductStockForOrder, startTimer]);

  // ---------- Attendance ----------
  const todayKey = () => new Date().toISOString().slice(0, 10);

  const getTodayAttendance = useCallback(
    (userId) => attendance.find((a) => a.userId === userId && a.date === todayKey()),
    [attendance]
  );

  const checkIn = useCallback(async (currentUser, photoBase64 = null) => {
  if (!currentUser) return { ok: false, error: "Walay user." };
  const date = todayKey();
  const existing = attendance.find(
    (a) => a.userId === currentUser.id && a.date === date
  );
  if (existing) return { ok: false, error: "Naka-check-in na ka karon." };

  const now = new Date();
  const [h, m] = parseShiftTime(currentUser.shiftStart || "9:00 AM");
  const shiftStart = new Date(now);
  shiftStart.setHours(h, m, 0, 0);
  const status = now.getTime() > shiftStart.getTime() + 15 * 60 * 1000 ? "LATE" : "ON TIME";

  try {
    const id = `a${Date.now()}`;
    await setDoc(doc(db, "attendance", id), {
      userId: currentUser.id,
      name: currentUser.name,
      email: currentUser.email || "",
      date,
      checkIn: now.toISOString(),
      checkInTimestamp: Date.now(),
      checkOut: null,
      checkOutTimestamp: null,
      status,
      photoBase64: photoBase64 || null, // 🔥 image evidence
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) {
    console.error("checkIn error:", e);
    return { ok: false, error: e.message };
  }
}, [attendance]);

 const checkOut = useCallback(async (currentUser) => {
  const date = todayKey();
  const record = attendance.find(
    (a) => a.userId === currentUser.id && a.date === date && !a.checkOut
  );
  if (!record) return { ok: false, error: "Walay active check-in." };

  try {
    const now = new Date();
    await updateDoc(doc(db, "attendance", record.id), {
      checkOut: now.toISOString(),
      checkOutTimestamp: Date.now(),
    });
    return { ok: true };
  } catch (e) {
    console.error("checkOut error:", e);
    return { ok: false, error: e.message };
  }
}, [attendance]);

  const value = {
    user, login, logout,
    menu: MENU,
    stock: data.stock,
    timers,
    stations,
    notifications,
    attendance,        // 🔥 gikan na sa Firestore
    orders: data.orders,
    startTimer, dismissTimer,
    assignStation,
    sendNotification,
    markNotificationRead,
    updateStockQuantity, completeOrder,
    checkIn, checkOut, getTodayAttendance,
    loaded: loaded && authReady,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function parseShiftTime(label) {
  const [time, meridiem] = label.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return [h, m];
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}