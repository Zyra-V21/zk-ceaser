use wasm_bindgen::prelude::*;
use sha3::{Digest, Keccak256};
use crate::{PedersenCommitment, CircleStarkRangeProof};

/// Genera un commitment de Pedersen para ocultar el monto
#[wasm_bindgen]
pub fn generate_pedersen_commitment(
    amount_wei: &str,
    nonce: &str,
) -> Result<PedersenCommitment, JsValue> {
    // Parsear monto
    let amount = amount_wei.parse::<u128>()
        .map_err(|e| format!("Invalid amount: {}", e))?;
    
    // Parsear nonce (hex string)
    let nonce_bytes = hex::decode(nonce.trim_start_matches("0x"))
        .map_err(|e| format!("Invalid nonce hex: {}", e))?;
    
    // Simular Pedersen commitment usando Keccak (placeholder)
    // En producción, usar la implementación real de Pedersen de StarkNet
    let mut hasher = Keccak256::new();
    hasher.update(amount.to_le_bytes());
    hasher.update(&nonce_bytes);
    let commitment_hash = hasher.finalize();
    
    // Generar coordenadas de punto de curva elíptica (simulado)
    let mut x_hasher = Keccak256::new();
    x_hasher.update(&commitment_hash);
    x_hasher.update(b"x_coord");
    let x_coord = x_hasher.finalize();
    
    let mut y_hasher = Keccak256::new();
    y_hasher.update(&commitment_hash);
    y_hasher.update(b"y_coord");
    let y_coord = y_hasher.finalize();
    
    Ok(PedersenCommitment {
        x: format!("0x{}", hex::encode(x_coord)),
        y: format!("0x{}", hex::encode(y_coord)),
        commitment_hash: format!("0x{}", hex::encode(commitment_hash)),
    })
}

/// Verifica un commitment de Pedersen
#[wasm_bindgen]
pub fn verify_pedersen_commitment(commitment: &PedersenCommitment) -> Result<bool, JsValue> {
    // Verificaciones básicas de formato
    let x_valid = commitment.x.starts_with("0x") && commitment.x.len() == 66;
    let y_valid = commitment.y.starts_with("0x") && commitment.y.len() == 66;
    let hash_valid = commitment.commitment_hash.starts_with("0x") && commitment.commitment_hash.len() == 66;
    
    Ok(x_valid && y_valid && hash_valid)
}

/// Genera nullifier único para evitar doble gasto
#[wasm_bindgen]
pub fn generate_nullifier(
    commitment_hash: &str,
    user_secret: &str,
) -> Result<String, JsValue> {
    let commitment_bytes = hex::decode(commitment_hash.trim_start_matches("0x"))
        .map_err(|e| format!("Invalid commitment hash: {}", e))?;
    
    let secret_bytes = hex::decode(user_secret.trim_start_matches("0x"))
        .map_err(|e| format!("Invalid user secret: {}", e))?;
    
    let mut hasher = Keccak256::new();
    hasher.update(&commitment_bytes);
    hasher.update(&secret_bytes);
    hasher.update(b"nullifier");
    let nullifier = hasher.finalize();
    
    Ok(format!("0x{}", hex::encode(nullifier)))
}

/// Genera range proof usando arkworks (fallback si STWO no está disponible)
#[wasm_bindgen]
pub fn generate_arkworks_range_proof(
    amount_wei: &str,
    nonce: &str,
    min_amount: &str,
    max_amount: &str,
) -> Result<CircleStarkRangeProof, JsValue> {
    let amount = amount_wei.parse::<u128>()
        .map_err(|e| format!("Invalid amount: {}", e))?;
    let min = min_amount.parse::<u128>()
        .map_err(|e| format!("Invalid min amount: {}", e))?;
    let max = max_amount.parse::<u128>()
        .map_err(|e| format!("Invalid max amount: {}", e))?;
    
    // Verificar que el monto está en rango
    if amount < min || amount > max {
        return Err(format!("Amount {} not in range [{}, {}]", amount, min, max).into());
    }
    
    // Simular generación de range proof usando arkworks
    // En producción, implementar el circuito real de range proof
    let mut proof_data = Vec::new();
    let mut public_inputs = Vec::new();
    
    // Mock proof data
    for i in 0u32..8 {
        let mut hasher = Keccak256::new();
        hasher.update(amount.to_le_bytes());
        hasher.update(nonce.as_bytes());
        hasher.update(&i.to_le_bytes());
        let hash = hasher.finalize();
        proof_data.push(format!("0x{}", hex::encode(hash)));
    }
    
    // Public inputs: min, max (ocultar amount)
    public_inputs.push(format!("0x{:032x}", min));
    public_inputs.push(format!("0x{:032x}", max));
    
    Ok(CircleStarkRangeProof {
        proof_data,
        public_inputs,
        circle_evaluations: vec![], // Se llenará con STWO
        fri_commitments: vec![],    // Se llenará con STWO
    })
}

/// Encripta metadata del receptor
#[wasm_bindgen]
pub fn encrypt_receiver_metadata(
    receiver_address: &str,
    user_secret: &str,
) -> Result<String, JsValue> {
    // Encriptación simple usando XOR con hash del secreto
    let secret_bytes = hex::decode(user_secret.trim_start_matches("0x"))
        .map_err(|e| format!("Invalid user secret: {}", e))?;
    
    let mut key_hasher = Keccak256::new();
    key_hasher.update(&secret_bytes);
    key_hasher.update(b"encryption_key");
    let key = key_hasher.finalize();
    
    let receiver_bytes = receiver_address.as_bytes();
    let mut encrypted = Vec::new();
    
    for (i, &byte) in receiver_bytes.iter().enumerate() {
        encrypted.push(byte ^ key[i % key.len()]);
    }
    
    Ok(format!("0x{}", hex::encode(encrypted)))
}

/// Verifica range proof
#[wasm_bindgen]
pub fn verify_range_proof(proof: &CircleStarkRangeProof) -> Result<bool, JsValue> {
    // Verificaciones básicas de formato
    let has_proof_data = !proof.proof_data.is_empty();
    let has_public_inputs = proof.public_inputs.len() >= 2;
    
    // En producción, verificar la prueba criptográfica real
    Ok(has_proof_data && has_public_inputs)
}
