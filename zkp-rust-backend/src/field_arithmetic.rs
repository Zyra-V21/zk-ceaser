use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

/// Implementación de aritmética en el campo M31 (2^31 - 1)
/// Usado por Circle STARKs y STWO

const M31_MODULUS: u32 = (1u32 << 31) - 1; // 2^31 - 1 = 2147483647

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct M31Element {
    value: u32,
}

#[wasm_bindgen]
impl M31Element {
    #[wasm_bindgen(constructor)]
    pub fn new(value: u32) -> M31Element {
        M31Element {
            value: value % M31_MODULUS,
        }
    }
    
    #[wasm_bindgen(getter)]
    pub fn value(&self) -> u32 {
        self.value
    }
    
    /// Suma en M31
    #[wasm_bindgen]
    pub fn add(&self, other: &M31Element) -> M31Element {
        let sum = (self.value as u64 + other.value as u64) % M31_MODULUS as u64;
        M31Element { value: sum as u32 }
    }
    
    /// Resta en M31
    #[wasm_bindgen]
    pub fn sub(&self, other: &M31Element) -> M31Element {
        let diff = if self.value >= other.value {
            self.value - other.value
        } else {
            M31_MODULUS - (other.value - self.value)
        };
        M31Element { value: diff }
    }
    
    /// Multiplicación en M31
    #[wasm_bindgen]
    pub fn mul(&self, other: &M31Element) -> M31Element {
        let product = (self.value as u64 * other.value as u64) % M31_MODULUS as u64;
        M31Element { value: product as u32 }
    }
    
    /// Inverso multiplicativo en M31
    #[wasm_bindgen]
    pub fn inv(&self) -> Result<M31Element, JsValue> {
        if self.value == 0 {
            return Err("Cannot invert zero".into());
        }
        
        // Usar algoritmo extendido de Euclides
        let inv = mod_inverse(self.value as i64, M31_MODULUS as i64)
            .ok_or("Inverse does not exist")?;
        
        Ok(M31Element { value: inv as u32 })
    }
    
    /// División en M31
    #[wasm_bindgen]
    pub fn div(&self, other: &M31Element) -> Result<M31Element, JsValue> {
        let inv = other.inv()?;
        Ok(self.mul(&inv))
    }
    
    /// Exponenciación en M31
    #[wasm_bindgen]
    pub fn pow(&self, exp: u32) -> M31Element {
        if exp == 0 {
            return M31Element { value: 1 };
        }
        
        let mut result = M31Element { value: 1 };
        let mut base = *self;
        let mut exponent = exp;
        
        while exponent > 0 {
            if exponent & 1 == 1 {
                result = result.mul(&base);
            }
            base = base.mul(&base);
            exponent >>= 1;
        }
        
        result
    }
    
    /// Convierte a string hexadecimal
    #[wasm_bindgen]
    pub fn to_hex(&self) -> String {
        format!("0x{:08x}", self.value)
    }
    
    /// Crea desde string hexadecimal
    #[wasm_bindgen]
    pub fn from_hex(hex: &str) -> Result<M31Element, JsValue> {
        let hex_clean = hex.trim_start_matches("0x");
        let value = u32::from_str_radix(hex_clean, 16)
            .map_err(|e| format!("Invalid hex: {}", e))?;
        Ok(M31Element::new(value))
    }
}

/// Implementación del algoritmo extendido de Euclides para encontrar el inverso modular
fn mod_inverse(a: i64, m: i64) -> Option<i64> {
    if m == 1 {
        return Some(0);
    }
    
    let (mut old_r, mut r) = (a, m);
    let (mut old_s, mut s) = (1, 0);
    
    while r != 0 {
        let quotient = old_r / r;
        let temp_r = r;
        r = old_r - quotient * r;
        old_r = temp_r;
        
        let temp_s = s;
        s = old_s - quotient * s;
        old_s = temp_s;
    }
    
    if old_r > 1 {
        None // No es invertible
    } else {
        Some(if old_s < 0 { old_s + m } else { old_s })
    }
}

/// Vector de elementos M31 para operaciones batch
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct M31Vector {
    elements: Vec<M31Element>,
}

#[wasm_bindgen]
impl M31Vector {
    #[wasm_bindgen(constructor)]
    pub fn new() -> M31Vector {
        M31Vector {
            elements: Vec::new(),
        }
    }
    
    /// Agrega un elemento al vector
    #[wasm_bindgen]
    pub fn push(&mut self, element: M31Element) {
        self.elements.push(element);
    }
    
    /// Obtiene un elemento por índice
    #[wasm_bindgen]
    pub fn get(&self, index: usize) -> Option<M31Element> {
        self.elements.get(index).copied()
    }
    
    /// Longitud del vector
    #[wasm_bindgen]
    pub fn len(&self) -> usize {
        self.elements.len()
    }
    
    /// Suma elemento a elemento con otro vector
    #[wasm_bindgen]
    pub fn add_vector(&self, other: &M31Vector) -> Result<M31Vector, JsValue> {
        if self.elements.len() != other.elements.len() {
            return Err("Vectors must have same length".into());
        }
        
        let result: Vec<M31Element> = self.elements
            .iter()
            .zip(other.elements.iter())
            .map(|(a, b)| a.add(b))
            .collect();
        
        Ok(M31Vector { elements: result })
    }
    
    /// Producto punto con otro vector
    #[wasm_bindgen]
    pub fn dot_product(&self, other: &M31Vector) -> Result<M31Element, JsValue> {
        if self.elements.len() != other.elements.len() {
            return Err("Vectors must have same length".into());
        }
        
        let mut result = M31Element::new(0);
        for (a, b) in self.elements.iter().zip(other.elements.iter()) {
            result = result.add(&a.mul(b));
        }
        
        Ok(result)
    }
    
    /// Convierte a array de strings hex
    #[wasm_bindgen]
    pub fn to_hex_array(&self) -> Vec<String> {
        self.elements.iter().map(|e| e.to_hex()).collect()
    }
}

/// Funciones utilitarias para aritmética M31

/// Convierte un u256 (como string) a elementos M31
#[wasm_bindgen]
pub fn u256_to_m31_elements(value_str: &str) -> Result<M31Vector, JsValue> {
    // Parsear el valor u256
    let value = value_str.parse::<u128>()
        .map_err(|e| format!("Invalid u256: {}", e))?;
    
    // Dividir en chunks de 31 bits
    let mut elements = Vec::new();
    let mut remaining = value;
    
    while remaining > 0 {
        let chunk = (remaining & ((1u128 << 31) - 1)) as u32;
        elements.push(M31Element::new(chunk));
        remaining >>= 31;
    }
    
    // Asegurar al menos un elemento
    if elements.is_empty() {
        elements.push(M31Element::new(0));
    }
    
    Ok(M31Vector { elements })
}

/// Evalúa un polinomio en un punto usando elementos M31
#[wasm_bindgen]
pub fn evaluate_polynomial_m31(
    coefficients: &M31Vector,
    point: &M31Element,
) -> M31Element {
    if coefficients.elements.is_empty() {
        return M31Element::new(0);
    }
    
    // Usar el método de Horner para evaluación eficiente
    let mut result = coefficients.elements[coefficients.elements.len() - 1];
    
    for i in (0..coefficients.elements.len() - 1).rev() {
        result = result.mul(point).add(&coefficients.elements[i]);
    }
    
    result
}

/// Genera puntos en el círculo unitario para Circle STARKs
#[wasm_bindgen]
pub fn generate_circle_points(num_points: u32) -> M31Vector {
    let mut points = Vec::new();
    
    for i in 0..num_points {
        // Generar puntos en el círculo unitario usando aproximación entera
        let angle_num = (i as u64 * 2u64.pow(20)) / num_points as u64; // Aproximación de 2π
        let cos_approx = ((angle_num as f64 / 2f64.powf(20.0) * 2.0 * std::f64::consts::PI).cos() * 1000000.0) as u32;
        
        points.push(M31Element::new(cos_approx % M31_MODULUS));
    }
    
    M31Vector { elements: points }
}

/// Información sobre el campo M31
#[wasm_bindgen]
pub fn get_m31_info() -> JsValue {
    let info = serde_json::json!({
        "name": "M31 Field",
        "modulus": M31_MODULUS,
        "modulus_hex": format!("0x{:08x}", M31_MODULUS),
        "characteristic": "2^31 - 1",
        "size_bits": 31,
        "is_prime": true,
        "generator": 3,
        "applications": [
            "Circle STARKs",
            "STWO Prover",
            "Fast polynomial arithmetic"
        ]
    });
    
    JsValue::from_str(&info.to_string())
}

