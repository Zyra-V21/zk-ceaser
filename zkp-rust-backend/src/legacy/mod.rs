// LEGACY CODE - SOLO PARA REFERENCIA Y TESTING
// Este código NO se usa en producción
// Mantener solo para comparación y debugging

#[cfg(feature = "mock-stwo")]
pub mod stwo_mock;

#[cfg(feature = "mock-stwo")]
pub use stwo_mock::*;

// Advertencia clara para desarrollo
#[cfg(feature = "mock-stwo")]
pub fn warn_legacy_usage() {
    eprintln!("⚠️  WARNING: Using LEGACY/MOCK STWO implementation!");
    eprintln!("⚠️  This is NOT cryptographically secure!");
    eprintln!("⚠️  For production, use --features real-stwo");
}
