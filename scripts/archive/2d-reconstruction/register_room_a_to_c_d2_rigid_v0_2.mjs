#!/usr/bin/env node

// Versioned entry point for the orientation-corrected diagnostic.
process.argv.push("--v0.2");
await import("./register_room_a_to_c_d2_rigid_v0_1.mjs");
