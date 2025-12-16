#🪙 Solana Calculator Program 

This project demonstrates how to **test a Solana on-chain program locally** using **LiteSVM** and **Bun**, without deploying to a real Solana cluster.

The on-chain program implements a simple **calculator/counter** with multiple instructions such as `Init`, `Double`, `Half`, `Add`, and `Sub`, and the test suite validates each operation end-to-end.

---

## 📁 Project Structure

```
.
├── calculator.so        # Compiled Solana program (Rust)
├── calculator.rs        # Rust on-chain program source
├── calculator.test.ts   # Bun + LiteSVM test
└── README.md
```

---

## ⚙️ Tech Stack

* **Solana** (on-chain program)
* **Borsh** (state & instruction encoding)
* **LiteSVM** (local Solana VM)
* **@solana/web3.js**
* **Bun** (testing framework)

---

## 🧠 Program Logic (Rust)

### State

```rust
struct Counter {
    count: u32
}
```

### Instructions

```rust
enum Ins_type {
    Init,              // sets count = 1
    Double,            // count *= 2
    Half,              // count /= 2
    Add { amt: u32 },  // count += amt
    Sub { amt: u32 }   // count -= amt
}
```

## 🧪 Test Flow (TypeScript)

The test simulates a full Solana execution lifecycle:

1. Start a **LiteSVM** instance
2. Load the compiled program (`calculator.so`)
3. Create:

   * User wallet
   * Program-owned data account
4. Airdrop SOL to the user
5. Execute instructions sequentially:

   * `Init` → value becomes `1`
   * `Double` → value becomes `2`
   * `Half` → value becomes `1`
   * `Add(4)` → value becomes `5`
   * `Sub(5)` → value becomes `0`
6. Assert on raw account data bytes after every step

All instructions are sent using `TransactionInstruction` exactly like real Solana transactions.

---

## ▶️ Running the Tests

### Install dependencies

```bash
bun install
```

### Run tests

```bash
bun test
```

---
