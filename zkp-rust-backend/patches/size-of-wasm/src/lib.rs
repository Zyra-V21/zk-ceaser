//! WASM-compatible implementation of size-of crate
//! 
//! This is a minimal implementation that removes the problematic ABI-specific
//! function pointer implementations that don't work in wasm32-unknown-unknown

#![no_std]

extern crate alloc;
use alloc::collections::BTreeMap;

/// Context for size calculation (simplified for WASM)
pub struct Context {
    pub visited: BTreeMap<usize, usize>,
}

impl Context {
    pub fn new() -> Self {
        Self {
            visited: BTreeMap::new(),
        }
    }
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

/// Trait for getting the size of a type
pub trait SizeOf: Sized {
    /// Returns the size of the type in bytes
    fn size_of() -> usize {
        core::mem::size_of::<Self>()
    }
    
    /// Calculate size including children (default implementation)
    fn size_of_children(&self, _context: &mut Context) {}
}

// Implement SizeOf for basic types
impl SizeOf for u8 {}
impl SizeOf for u16 {}
impl SizeOf for u32 {}
impl SizeOf for u64 {}
impl SizeOf for u128 {}
impl SizeOf for usize {}
impl SizeOf for i8 {}
impl SizeOf for i16 {}
impl SizeOf for i32 {}
impl SizeOf for i64 {}
impl SizeOf for i128 {}
impl SizeOf for isize {}
impl SizeOf for f32 {}
impl SizeOf for f64 {}
impl SizeOf for bool {}
impl SizeOf for char {}

// Implement for arrays
impl<T: SizeOf, const N: usize> SizeOf for [T; N] {
    fn size_of() -> usize {
        T::size_of() * N
    }
}

// Implement for tuples (up to reasonable size)
impl<T: SizeOf, U: SizeOf> SizeOf for (T, U) {
    fn size_of() -> usize {
        T::size_of() + U::size_of()
    }
}

impl<T: SizeOf, U: SizeOf, V: SizeOf> SizeOf for (T, U, V) {
    fn size_of() -> usize {
        T::size_of() + U::size_of() + V::size_of()
    }
}

// For function pointers, we provide a WASM-compatible implementation
// that doesn't use the problematic extern ABI specifications
impl<T, U> SizeOf for fn(T) -> U {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T) -> U>()
    }
}

impl<T, U, V> SizeOf for fn(T, U) -> V {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T, U) -> V>()
    }
}

impl<T, U, V, W> SizeOf for fn(T, U, V) -> W {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T, U, V) -> W>()
    }
}

// Generic implementation for any type
impl<T> SizeOf for *const T {
    fn size_of() -> usize {
        core::mem::size_of::<*const T>()
    }
}

impl<T> SizeOf for *mut T {
    fn size_of() -> usize {
        core::mem::size_of::<*mut T>()
    }
}

// Re-export commonly used items for compatibility
pub use core::mem::size_of;




//! This is a minimal implementation that removes the problematic ABI-specific
//! function pointer implementations that don't work in wasm32-unknown-unknown

#![no_std]

extern crate alloc;
use alloc::collections::BTreeMap;

/// Context for size calculation (simplified for WASM)
pub struct Context {
    pub visited: BTreeMap<usize, usize>,
}

impl Context {
    pub fn new() -> Self {
        Self {
            visited: BTreeMap::new(),
        }
    }
}

impl Default for Context {
    fn default() -> Self {
        Self::new()
    }
}

/// Trait for getting the size of a type
pub trait SizeOf: Sized {
    /// Returns the size of the type in bytes
    fn size_of() -> usize {
        core::mem::size_of::<Self>()
    }
    
    /// Calculate size including children (default implementation)
    fn size_of_children(&self, _context: &mut Context) {}
}

// Implement SizeOf for basic types
impl SizeOf for u8 {}
impl SizeOf for u16 {}
impl SizeOf for u32 {}
impl SizeOf for u64 {}
impl SizeOf for u128 {}
impl SizeOf for usize {}
impl SizeOf for i8 {}
impl SizeOf for i16 {}
impl SizeOf for i32 {}
impl SizeOf for i64 {}
impl SizeOf for i128 {}
impl SizeOf for isize {}
impl SizeOf for f32 {}
impl SizeOf for f64 {}
impl SizeOf for bool {}
impl SizeOf for char {}

// Implement for arrays
impl<T: SizeOf, const N: usize> SizeOf for [T; N] {
    fn size_of() -> usize {
        T::size_of() * N
    }
}

// Implement for tuples (up to reasonable size)
impl<T: SizeOf, U: SizeOf> SizeOf for (T, U) {
    fn size_of() -> usize {
        T::size_of() + U::size_of()
    }
}

impl<T: SizeOf, U: SizeOf, V: SizeOf> SizeOf for (T, U, V) {
    fn size_of() -> usize {
        T::size_of() + U::size_of() + V::size_of()
    }
}

// For function pointers, we provide a WASM-compatible implementation
// that doesn't use the problematic extern ABI specifications
impl<T, U> SizeOf for fn(T) -> U {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T) -> U>()
    }
}

impl<T, U, V> SizeOf for fn(T, U) -> V {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T, U) -> V>()
    }
}

impl<T, U, V, W> SizeOf for fn(T, U, V) -> W {
    fn size_of() -> usize {
        core::mem::size_of::<fn(T, U, V) -> W>()
    }
}

// Generic implementation for any type
impl<T> SizeOf for *const T {
    fn size_of() -> usize {
        core::mem::size_of::<*const T>()
    }
}

impl<T> SizeOf for *mut T {
    fn size_of() -> usize {
        core::mem::size_of::<*mut T>()
    }
}

// Re-export commonly used items for compatibility
pub use core::mem::size_of;



