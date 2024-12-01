class IndexedDBWrapper {
  constructor(dbName, storeName = "store") {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.db) return;
    if (this.initPromise) return await this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      request.onerror = (e) => {
        reject(new Error(`IndexedDB open error: ${e.target.errorCode}`));
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
    });
    await this.initPromise;
  }

  async operate(operation, key = null, value = null) {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(
        [this.storeName],
        operation === "get" || operation === "keys" ? "readonly" : "readwrite",
      );
      const objectStore = transaction.objectStore(this.storeName);

      let request;
      switch (operation) {
        case "get":
          request = objectStore.get(key);
          break;
        case "set":
          request = objectStore.put({ key, value });
          break;
        case "del":
          request = objectStore.delete(key);
          break;
        case "clear":
          request = objectStore.clear();
          request.onsuccess = () => resolve("Database cleared");
          return;
        case "keys":
          request = objectStore.getAllKeys();
          request.onsuccess = () => resolve(request.result.sort());
          return;
        default:
          reject(new Error(`Invalid operation: ${operation}`));
          return;
      }

      request.onsuccess = () => {
        if (operation === "get")
          resolve(request.result ? request.result.value : undefined);
        else resolve();
      };
      request.onerror = (e) => {
        reject(new Error(`Error ${operation} data: ${e.target.errorCode}`));
      };
    });
  }

  async get(key) {
    return this.operate("get", key);
  }

  async set(key, value) {
    return this.operate("set", key, value);
  }

  async del(key) {
    return this.operate("del", key);
  }

  async clear() {
    return this.operate("clear");
  }

  async keys() {
    return this.operate("keys");
  }

  async resetDatabase() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    await new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      deleteRequest.onsuccess = resolve;
      deleteRequest.onerror = (e) => {
        reject(new Error(`Failed to reset database: ${e.target.errorCode}`));
      };
    });
    await this.init();
  }
}

function formatNumber(num, option = {}) {
  const { maximumFractionDigits = 3, useGrouping = true } = option;

  const numericValue = Number(num);
  if (isNaN(numericValue)) throw new TypeError("Input must be a valid number.");

  const threshold = 1 / Math.pow(10, maximumFractionDigits); // O.001
  if (Math.abs(numericValue) < threshold) return "0";

  const roundedNum = Number(numericValue.toFixed(maximumFractionDigits)),
    [integerPart, decimalPart] = roundedNum.toString().split("."),
    formattedInteger = useGrouping
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : integerPart,
    formattedDecimal =
      decimalPart && decimalPart.length > 0 ? `.${decimalPart}` : "";

  return formattedInteger + formattedDecimal;
}
