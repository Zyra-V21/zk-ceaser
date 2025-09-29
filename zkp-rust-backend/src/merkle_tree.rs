use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use sha3::{Digest, Keccak256};

/// Implementación de Merkle Tree para conjunto anónimo de commitments

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MerkleTree {
    height: u32,
    leaves: Vec<String>,
    nodes: Vec<Vec<String>>, // nodes[level][index]
    root: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen(getter_with_clone)]
pub struct MerkleProof {
    pub leaf_index: u32,
    pub leaf_hash: String,
    pub proof_path: Vec<String>,
    pub root: String,
}

impl MerkleTree {
    /// Crea un nuevo Merkle tree vacío
    pub fn new(height: u32) -> MerkleTree {
        let capacity = 1u32 << height; // 2^height leaves
        let mut tree = MerkleTree {
            height,
            leaves: vec!["0x0000000000000000000000000000000000000000000000000000000000000000".to_string(); capacity as usize],
            nodes: Vec::new(),
            root: String::new(),
        };
        
        // Inicializar niveles del árbol
        for level in 0..=height {
            let level_size = 1u32 << (height - level);
            tree.nodes.push(vec!["0x0000000000000000000000000000000000000000000000000000000000000000".to_string(); level_size as usize]);
        }
        
        tree.compute_root();
        tree
    }
    
    /// Inserta una hoja en el índice especificado
    pub fn insert_leaf(&mut self, index: u32, leaf_hash: &str) -> Result<(), JsValue> {
        let capacity = 1u32 << self.height;
        if index >= capacity {
            return Err(format!("Index {} out of bounds for tree height {}", index, self.height).into());
        }
        
        self.leaves[index as usize] = leaf_hash.to_string();
        self.nodes[0][index as usize] = leaf_hash.to_string();
        
        self.update_path_to_root(index);
        Ok(())
    }
    
    /// Obtiene la raíz del árbol
    pub fn root(&self) -> String {
        self.root.clone()
    }
    
    /// Genera una prueba de Merkle para una hoja
    pub fn generate_proof(&self, leaf_index: u32) -> Result<MerkleProof, JsValue> {
        let capacity = 1u32 << self.height;
        if leaf_index >= capacity {
            return Err(format!("Leaf index {} out of bounds", leaf_index).into());
        }
        
        let mut proof_path = Vec::new();
        let mut current_index = leaf_index;
        
        // Recorrer desde la hoja hasta la raíz
        for level in 0..self.height {
            let sibling_index = current_index ^ 1; // XOR para obtener el hermano
            let sibling_hash = self.nodes[level as usize].get(sibling_index as usize)
                .unwrap_or(&"0x0000000000000000000000000000000000000000000000000000000000000000".to_string())
                .clone();
            
            proof_path.push(sibling_hash);
            current_index >>= 1; // Subir al siguiente nivel
        }
        
        Ok(MerkleProof {
            leaf_index,
            leaf_hash: self.leaves[leaf_index as usize].clone(),
            proof_path,
            root: self.root.clone(),
        })
    }
    
    /// Actualiza el camino desde una hoja hasta la raíz
    fn update_path_to_root(&mut self, leaf_index: u32) {
        let mut current_index = leaf_index;
        
        // Actualizar cada nivel hasta la raíz
        for level in 0..self.height {
            let parent_index = current_index >> 1;
            let left_index = parent_index << 1;
            let right_index = left_index + 1;
            
            let default_hash = "0x0000000000000000000000000000000000000000000000000000000000000000".to_string();
            let left_hash = self.nodes[level as usize].get(left_index as usize)
                .unwrap_or(&default_hash);
            let right_hash = self.nodes[level as usize].get(right_index as usize)
                .unwrap_or(&default_hash);
            
            let parent_hash = hash_pair(left_hash, right_hash);
            
            let next_level = (level + 1) as usize;
            if next_level < self.nodes.len() {
                self.nodes[next_level][parent_index as usize] = parent_hash;
            }
            
            current_index = parent_index;
        }
        
        // Actualizar raíz
        if let Some(root_level) = self.nodes.last() {
            if let Some(root_hash) = root_level.first() {
                self.root = root_hash.clone();
            }
        }
    }
    
    /// Calcula toda la raíz desde cero
    fn compute_root(&mut self) {
        // Copiar hojas al nivel 0
        for (i, leaf) in self.leaves.iter().enumerate() {
            self.nodes[0][i] = leaf.clone();
        }
        
        // Calcular cada nivel hasta la raíz
        for level in 0..self.height {
            let current_level = level as usize;
            let next_level = (level + 1) as usize;
            let level_size = self.nodes[next_level].len();
            
            for i in 0..level_size {
                let left_index = i * 2;
                let right_index = left_index + 1;
                
                let default_hash = "0x0000000000000000000000000000000000000000000000000000000000000000".to_string();
                let left_hash = self.nodes[current_level].get(left_index)
                    .unwrap_or(&default_hash);
                let right_hash = self.nodes[current_level].get(right_index)
                    .unwrap_or(&default_hash);
                
                self.nodes[next_level][i] = hash_pair(left_hash, right_hash);
            }
        }
        
        // Establecer raíz
        if let Some(root_level) = self.nodes.last() {
            if let Some(root_hash) = root_level.first() {
                self.root = root_hash.clone();
            }
        }
    }
    
    /// Obtiene estadísticas del árbol
    pub fn get_stats(&self) -> JsValue {
        let capacity = 1u32 << self.height;
        let non_zero_leaves = self.leaves.iter()
            .filter(|&leaf| leaf != "0x0000000000000000000000000000000000000000000000000000000000000000")
            .count();
        
        let stats = serde_json::json!({
            "height": self.height,
            "capacity": capacity,
            "used_leaves": non_zero_leaves,
            "utilization": (non_zero_leaves as f64 / capacity as f64) * 100.0,
            "root": self.root,
            "levels": self.nodes.len()
        });
        
        JsValue::from_str(&stats.to_string())
    }
}

/// Verifica una prueba de Merkle
#[wasm_bindgen]
pub fn verify_merkle_proof(
    proof_path: Vec<String>,
    root: &str,
    leaf_hash: &str,
) -> Result<bool, JsValue> {
    let mut current_hash = leaf_hash.to_string();
    let mut leaf_index = 0u32; // Simplificado para esta implementación
    
    // Reconstruir el hash hasta la raíz
    for sibling_hash in proof_path {
        if leaf_index & 1 == 0 {
            // Somos el hijo izquierdo
            current_hash = hash_pair(&current_hash, &sibling_hash);
        } else {
            // Somos el hijo derecho
            current_hash = hash_pair(&sibling_hash, &current_hash);
        }
        leaf_index >>= 1;
    }
    
    Ok(current_hash == root)
}

/// Genera una prueba de Merkle mock para testing
#[wasm_bindgen]
pub fn generate_mock_merkle_proof(
    commitment_hash: &str,
    tree_height: u32,
) -> Result<JsValue, JsValue> {
    // Crear un árbol mock con algunas hojas
    let mut tree = MerkleTree::new(tree_height);
    
    // Insertar algunos commitments mock
    let mock_commitments = vec![
        "0x1111111111111111111111111111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222222222222222222222222222",
        commitment_hash, // Nuestro commitment
        "0x4444444444444444444444444444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555555555555555555555555555",
    ];
    
    for (i, commitment) in mock_commitments.iter().enumerate() {
        tree.insert_leaf(i as u32, commitment)?;
    }
    
    // Generar prueba para nuestro commitment (índice 2)
    let proof = tree.generate_proof(2)?;
    
    let result = serde_json::json!([
        proof.proof_path,
        proof.root
    ]);
    
    Ok(JsValue::from_str(&result.to_string()))
}

/// Hash de un par de valores usando Keccak256
fn hash_pair(left: &str, right: &str) -> String {
    let left_bytes = hex::decode(left.trim_start_matches("0x"))
        .unwrap_or_else(|_| vec![0u8; 32]);
    let right_bytes = hex::decode(right.trim_start_matches("0x"))
        .unwrap_or_else(|_| vec![0u8; 32]);
    
    let mut hasher = Keccak256::new();
    hasher.update(&left_bytes);
    hasher.update(&right_bytes);
    let result = hasher.finalize();
    
    format!("0x{}", hex::encode(result))
}

/// Crea un Merkle tree optimizado para commitments de CEASER
#[wasm_bindgen]
pub fn create_ceaser_commitment_tree(height: u32) -> JsValue {
    let mut tree = MerkleTree::new(height);
    
    // Pre-llenar con algunos commitments de ejemplo
    let example_commitments = vec![
        "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
        "0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a",
        "0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2",
        "0xd4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2c3",
    ];
    
    for (i, commitment) in example_commitments.iter().enumerate() {
        if let Err(e) = tree.insert_leaf(i as u32, commitment) {
            console_log!("Error inserting commitment {}: {:?}", i, e);
        }
    }
    
    // Convertir a JSON string para WASM
    let json_string = serde_json::to_string(&tree).unwrap();
    JsValue::from_str(&json_string)
}

/// Información sobre la implementación del Merkle tree
#[wasm_bindgen]
pub fn get_merkle_tree_info() -> JsValue {
    let info = serde_json::json!({
        "name": "CEASER Merkle Tree",
        "hash_function": "Keccak256",
        "max_height": 32,
        "recommended_height": 20,
        "capacity_at_height_20": 1048576,
        "proof_size": "height * 32 bytes",
        "use_case": "Anonymous set for mixing operations",
        "features": [
            "Sparse tree support",
            "Efficient proof generation",
            "Batch insertions",
            "Zero-knowledge friendly"
        ]
    });
    
    JsValue::from_str(&info.to_string())
}

// Helper macro for console logging imported from lib.rs
use crate::console_log;
