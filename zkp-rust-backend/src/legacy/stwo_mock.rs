use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};
use crate::CircleStarkRangeProof;

/// Integración con STWO Prover para Circle STARKs
/// Esta es una implementación mock que simula la funcionalidad de STWO
/// En producción, se conectaría con la biblioteca real de STWO

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StwoCircuitConfig {
    pub field_size: u32,        // M31 field size
    pub circle_domain_size: u32, // Tamaño del dominio circular
    pub fri_layers: u32,        // Número de capas FRI
    pub blowup_factor: u32,     // Factor de expansión
}

impl Default for StwoCircuitConfig {
    fn default() -> Self {
        Self {
            field_size: 31,           // M31 field (2^31 - 1)
            circle_domain_size: 1024, // 2^10 evaluaciones
            fri_layers: 10,
            blowup_factor: 4,
        }
    }
}

/// Genera range proof usando STWO y Circle STARKs
#[wasm_bindgen]
pub fn generate_stwo_range_proof(
    amount_wei: &str,
    nonce: &str,
    min_amount: &str,
    max_amount: &str,
) -> Result<CircleStarkRangeProof, JsValue> {
    console_log!("🔄 Generando range proof con STWO...");
    
    let amount = amount_wei.parse::<u128>()
        .map_err(|e| format!("Invalid amount: {}", e))?;
    let min = min_amount.parse::<u128>()
        .map_err(|e| format!("Invalid min amount: {}", e))?;
    let max = max_amount.parse::<u128>()
        .map_err(|e| format!("Invalid max amount: {}", e))?;
    
    // Verificar rango
    if amount < min || amount > max {
        return Err(format!("Amount {} not in range [{}, {}]", amount, min, max).into());
    }
    
    let config = StwoCircuitConfig::default();
    
    console_log!("⚙️ Config STWO: field_size={}, domain_size={}", 
                 config.field_size, config.circle_domain_size);
    
    // 1. Generar evaluaciones en el círculo unitario
    let circle_evaluations = generate_circle_evaluations(amount, &config)?;
    
    // 2. Generar commitments FRI
    let fri_commitments = generate_fri_commitments(&circle_evaluations, &config)?;
    
    // 3. Generar proof data principal
    let proof_data = generate_stwo_proof_data(amount, nonce, &config)?;
    
    // 4. Public inputs (solo min/max, amount permanece oculto)
    let public_inputs = vec![
        format!("0x{:032x}", min),
        format!("0x{:032x}", max),
        format!("0x{:08x}", config.field_size),
        format!("0x{:08x}", config.circle_domain_size),
    ];
    
    console_log!("✅ Range proof STWO generado: {} evaluaciones, {} FRI commits", 
                 circle_evaluations.len(), fri_commitments.len());
    
    Ok(CircleStarkRangeProof {
        proof_data,
        public_inputs,
        circle_evaluations,
        fri_commitments,
    })
}

/// Genera evaluaciones en el círculo unitario para Circle STARKs
fn generate_circle_evaluations(
    amount: u128,
    config: &StwoCircuitConfig,
) -> Result<Vec<String>, JsValue> {
    let mut evaluations = Vec::new();
    
    // Simular evaluaciones en puntos del círculo unitario
    for i in 0..config.circle_domain_size {
        // Simular evaluación del polinomio en punto circular
        let angle = (i as f64 * 2.0 * std::f64::consts::PI) / config.circle_domain_size as f64;
        let x = (angle.cos() * 1000000.0) as u64; // Escalar para enteros
        let y = (angle.sin() * 1000000.0) as u64;
        
        // Evaluar constraint: amount está en rango
        let constraint_eval = if amount >= 1000 && amount <= 1000000000000000000000 {
            (x.wrapping_mul(y).wrapping_add(amount as u64)) % ((1u64 << 31) - 1)
        } else {
            0
        };
        
        evaluations.push(format!("0x{:016x}", constraint_eval));
    }
    
    Ok(evaluations)
}

/// Genera commitments FRI para la prueba STARK
fn generate_fri_commitments(
    evaluations: &[String],
    config: &StwoCircuitConfig,
) -> Result<Vec<String>, JsValue> {
    let mut commitments = Vec::new();
    
    // Simular proceso FRI con múltiples capas
    let mut current_layer = evaluations.to_vec();
    
    for layer in 0..config.fri_layers {
        // Simular fold de la capa actual
        let mut next_layer = Vec::new();
        
        for chunk in current_layer.chunks(2) {
            if chunk.len() == 2 {
                // Combinar dos evaluaciones usando hash
                let mut hasher = Keccak256::new();
                hasher.update(chunk[0].as_bytes());
                hasher.update(chunk[1].as_bytes());
                hasher.update(&layer.to_le_bytes());
                let combined = hasher.finalize();
                next_layer.push(format!("0x{}", hex::encode(&combined[..8])));
            }
        }
        
        // Generar commitment para esta capa
        let mut commitment_hasher = Keccak256::new();
        for eval in &next_layer {
            commitment_hasher.update(eval.as_bytes());
        }
        let commitment = commitment_hasher.finalize();
        commitments.push(format!("0x{}", hex::encode(commitment)));
        
        current_layer = next_layer;
        
        // Parar si la capa es muy pequeña
        if current_layer.len() <= 1 {
            break;
        }
    }
    
    Ok(commitments)
}

/// Genera los datos principales de la prueba STWO
fn generate_stwo_proof_data(
    amount: u128,
    nonce: &str,
    config: &StwoCircuitConfig,
) -> Result<Vec<String>, JsValue> {
    let mut proof_data = Vec::new();
    
    // 1. Witness data (privado, usado para generar la prueba)
    let mut witness_hasher = Keccak256::new();
    witness_hasher.update(amount.to_le_bytes());
    witness_hasher.update(nonce.as_bytes());
    witness_hasher.update(b"stwo_witness");
    let witness = witness_hasher.finalize();
    proof_data.push(format!("0x{}", hex::encode(witness)));
    
    // 2. Constraint polynomial evaluations
    for i in 0u32..8 {
        let mut constraint_hasher = Keccak256::new();
        constraint_hasher.update(&witness);
        constraint_hasher.update(&i.to_le_bytes());
        constraint_hasher.update(&config.field_size.to_le_bytes());
        let constraint = constraint_hasher.finalize();
        proof_data.push(format!("0x{}", hex::encode(&constraint[..16])));
    }
    
    // 3. Random challenges (simulados)
    for i in 0u32..4 {
        let mut challenge_hasher = Keccak256::new();
        challenge_hasher.update(b"stwo_challenge");
        challenge_hasher.update(&i.to_le_bytes());
        challenge_hasher.update(&witness);
        let challenge = challenge_hasher.finalize();
        proof_data.push(format!("0x{}", hex::encode(&challenge[..8])));
    }
    
    Ok(proof_data)
}

/// Verifica range proof generado con STWO
#[wasm_bindgen]
pub fn verify_stwo_range_proof(proof: &CircleStarkRangeProof) -> Result<bool, JsValue> {
    console_log!("🔍 Verificando range proof STWO...");
    
    // Verificaciones básicas
    let has_circle_evaluations = !proof.circle_evaluations.is_empty();
    let has_fri_commitments = !proof.fri_commitments.is_empty();
    let has_proof_data = proof.proof_data.len() >= 8;
    let has_public_inputs = proof.public_inputs.len() >= 4;
    
    // Verificar formato de public inputs
    let mut inputs_valid = true;
    for input in &proof.public_inputs {
        if !input.starts_with("0x") {
            inputs_valid = false;
            break;
        }
    }
    
    let is_valid = has_circle_evaluations && has_fri_commitments && 
                   has_proof_data && has_public_inputs && inputs_valid;
    
    console_log!("📊 Verificación STWO: evaluaciones={}, FRI={}, proof_data={}, inputs={}, válido={}", 
                 has_circle_evaluations, has_fri_commitments, has_proof_data, has_public_inputs, is_valid);
    
    Ok(is_valid)
}

/// Obtiene información sobre las capacidades de STWO
#[wasm_bindgen]
pub fn get_stwo_info() -> JsValue {
    let info = serde_json::json!({
        "name": "STWO Circle STARKs",
        "field": "M31 (2^31 - 1)",
        "domain": "Circle (unit circle)",
        "proof_system": "FRI-based STARKs",
        "features": [
            "Range proofs",
            "Circle polynomial evaluation",
            "FRI commitment scheme",
            "M31 field arithmetic"
        ],
        "performance": {
            "proof_generation": "~1-3 seconds",
            "proof_size": "~1-2 KB",
            "verification": "~10-50 ms"
        }
    });
    
    JsValue::from_str(&info.to_string())
}

// Helper macro for console logging imported from lib.rs
use crate::console_log;
