#!/usr/bin/env node

// Versioned entry point for the Room C fixed-cupboard composition correction.
process.argv.push("--v0.2");
await import("./register_room_b_wc_to_ac_d3_rigid_v0_1.mjs");
