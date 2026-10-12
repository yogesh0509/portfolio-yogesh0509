## What it is

babybear-labs' `benchmark` compares zero-knowledge virtual machines and proving schemes on the same small programs, such as Fibonacci, SHA-256 and Poseidon hashing. Each system has its own folder.

## What I added

In November 2024 I added the **RISC Zero** folder, built on RISC Zero's starter template: the guest programs that run inside the zkVM (Fibonacci by matrix power, SHA-256, a Poseidon hash and a Merkle program), the host code that proves them, and the benchmark harness that records cycles and proof sizes.

The excerpt in this folder is the Poseidon guest, a small `no_std` Rust program that runs inside the zkVM.

I am not quoting benchmark numbers on this page.
