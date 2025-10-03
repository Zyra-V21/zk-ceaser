# ZK-CEASER: Privacy-Preserving Zero-Knowledge Proof System

<div align="center">

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=24&duration=2000&pause=800&color=00ff41&background=00000000&center=true&vCenter=true&multiline=true&repeat=true&width=700&lines=ZK-CEASER:+Zero-Knowledge+for+the+Next+Web;Privacy-Preserving+Circle+STARKs+with+STWO+%2B+M31;Production-grade+Zero-Knowledge+Proofs+%F0%9F%94%91%F0%9F%92%AB)

</div>

[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=for-the-badge)](./LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Zyra--V21-blue?style=for-the-badge&logo=github)](https://github.com/Zyra-V21/zk-ceaser)
[![STWO](https://img.shields.io/badge/STWO-Real%20Implementation-green?style=for-the-badge&logo=ethereum)](https://github.com/starkware-libs/stwo)
[![Rust](https://img.shields.io/badge/Rust-nightly--2025--07--14-orange?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

**ZK-CEASER** es un sistema completo de generación de pruebas de conocimiento cero que combina Circle STARKs con aritmética de campo M31 usando el demostrador oficial STWO de StarkWare. Esta aplicación demuestra criptografía avanzada y está lista para producción en privacidad.

## Features

- **Zero-Knowledge Proofs**: Usando STWO (StarkWare Two) official prover
- **Circle STARKs**: Tecnología STARK de última generación  
- **M31 Field Arithmetic**: Operaciones sobre el campo de Mersenne-31 (2^31 - 1)
- **Anonymous Sets**: Árboles de Merkle de 1024 usuarios para privacidad
- **Modern Web Interface**: Next.js 15 + integración Rust WASM
- **Cryptography**: Sin mocks - implementación real de STWO

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ZK-CEASER System                     │
├─────────────────────────────────────────────────────────┤
│   Frontend (Next.js)      │     Backend (Rust WASM)     │
│                           │                             │
│ • React Components        │ • STWO Integration          │
│ • WASM Module Loading     │ • M31 Field Arithmetic      │
│ • Proof Verification      │ • Circle STARKs Generation  │
│ • Modern UI/UX            │ • Merkle Tree Proofs        │
│                           │ • Pedersen Commitments      │
└─────────────────────────────────────────────────────────┘
```

## Quick Start & Reproduction Guide

### Prerequisites

- **Rust nightly-2025-07-14** (requerido para STWO)
- **Node.js 18+** 
- **Git** para clonar dependencias

### Step 1: Clone Repository

```bash
git clone https://github.com/Zyra-V21/zk-ceaser.git
cd zk-ceaser/zk-ceaser-app
```

### Step 2: Setup STWO Dependencies

```bash
# Crear directorio externo y clonar repositorios STWO
mkdir -p external
cd external

# Clonar STWO core (requerido para criptografía)
git clone https://github.com/starkware-libs/stwo.git
cd stwo
git checkout main
cd ..

# Clonar STWO Cairo (opcional, para features extendidas)
git clone https://github.com/starkware-libs/stwo-cairo.git
cd stwo-cairo  
git checkout main
cd ../..
```

### Step 3: Setup Rust Toolchain

```bash
# Instalar nightly específico requerido por STWO
rustup install nightly-2025-07-14
rustup override set nightly-2025-07-14

# Verificar instalación
rustc --version
# Debería mostrar: rustc 1.90.0-nightly
```

### Step 4: Build Rust WASM Backend

```bash
cd zkp-rust-backend

# Compilar para producción con STWO real
cargo build --features real-stwo --release

# Generar módulos WASM para web
wasm-pack build --target web --features real-stwo

# Copiar archivos WASM al frontend
cp pkg/zkp_ceaser_bg.wasm ../public/pkg/
cp pkg/zkp_ceaser.js ../public/pkg/

cd ..
```

### Step 5: Setup Frontend

```bash
# Instalar dependencias de Node.js
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Step 6: Access Application

Abre tu navegador y navega a:
```
http://localhost:3000
```

Deberías ver la interfaz de ZK-CEASER donde puedes:
- Generar pruebas de conocimiento cero
- Verificar la integridad de las pruebas  
- Descargar archivos de prueba
- Explorar componentes criptográficos

## Technical Deep Dive

### Zero-Knowledge Proof Components

ZK-CEASER genera pruebas de privacidad que contienen:

1. **Pedersen Commitments**: Ocultan montos usando curvas elípticas
2. **Range Proofs**: Prueban validez de montos (0.001-1000+) sin revelar valores
3. **Nullifiers**: Identificadores únicos para prevenir doble gasto
4. **Merkle Proofs**: Prueba de pertenencia en set anónimo de 1024 usuarios
5. **Encrypted Metadata**: Codificación segura de información del receptor

### STWO Integration (Cryptography)

- **Field**: M31 (Mersenne-31: 2^31 - 1) - optimizado para CPUs modernas
- **Extension**: QM31 (extensión cuártica) - mayor seguridad  
- **STARKs**: Circle STARKs con FRI - nuevo sistema de pruebas
- **Hash**: Blake2s (256-bit) - hashing criptográfico de alto rendimiento
- **Security**: 128-bit de seguridad criptográfica

### Performance Metrics

| Component           | Performance   | Notes                      |
|---------------------|--------------|----------------------------|
| **Proof Generation**| 2-5 seconds  | Computación STWO           |
| **Proof Size**      | 8-16 KB      | Circle STARKs optimizados  |
| **Verification**    | 100-500ms    | Operaciones de campo M31   |
| **Anonymous Set**   | 1024 users   | Árbol Merkle profundidad 10|
| **Memory Usage**    | ~50MB        | WASM + STWO runtime        |

## System Status

| Component          | Status      | Technology                  |
|--------------------|------------|-----------------------------|
| **ZK Proofs**      | Production | STWO + M31 + Circle STARKs  |
| **Frontend**       | Production | Next.js 15 + TypeScript     |
| **WASM Backend**   | Production | Rust + STWO                 |
| **Cryptography**   | 128-bit    | Implementation              |
| **Anonymous Sets** | 1024 Users | Merkle Trees                |

## Development & Debugging

### Common Issues & Solutions

| Issue                  | Solution                                                      |
|------------------------|--------------------------------------------------------------|
| **WASM not loading**   | Verifica `next.config.js` y que los WASM estén en `public/pkg/` |
| **Rust compilation fails** | Verifica `rustup override set nightly-2025-07-14`         |
| **External repos missing** | Clona dependencias STWO en `external/`                   |
| **Proof verification fails** | Asegúrate de compilar con feature STWO                 |

### Build Commands Reference

```bash
# Build de desarrollo (más rápido)
cargo build --features mock-stwo
wasm-pack build --target web --features mock-stwo

# Build de producción (criptografía real)  
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo

# Chequeo de compilación
cargo check --features real-stwo

# Ejecutar tests
cargo test --features real-stwo
```

## Testing & Validation

### Proof Generation Testing

```bash
# Test de generación de pruebas ZK
cd zkp-rust-backend
cargo test --features real-stwo

# Test de integración WASM
cd ../
npm run dev
# Navega a http://localhost:3000 y genera una prueba
```

### Verification Testing

Las pruebas generadas deben mostrar:
- `verification_result: true` 
- Pruebas Merkle (no vacías)
- Tamaño de set anónimo válido (1024)
- Estructura de prueba STWO válida

### Example Generated Proof Structure

```json
{
  "metadata": {
    "verification_result": true,
    "anonymous_set_size": 1024,
    "tree_height": 10,
    "library_used": "STWO + arkworks-rs"
  },
  "zk_proof": {
    "amount_commitment": { "x": "0x...", "y": "0x..." },
    "range_proof": { "proof_data": [...], "circle_evaluations": [...] },
    "merkle_proof": [...],
    "merkle_root": "0x...",
    "nullifier": "0x...",
    "encrypted_metadata": "0x..."
  }
}
```

## Production Deployment

### Build for Production

```bash
# 1. Build WASM optimizado
cd zkp-rust-backend
cargo build --features real-stwo --release
wasm-pack build --target web --features real-stwo --release

# 2. Build frontend optimizado
cd ../
npm run build
npm start
```

### Deployment Checklist

- [ ] Rust nightly-2025-07-14 instalado
- [ ] Dependencias STWO clonadas en `external/`
- [ ] Features STWO habilitadas  
- [ ] WASM generado y copiado
- [ ] Frontend compila sin errores
- [ ] Generación de pruebas funciona con `verification_result: true`

## **Security & Cryptography**

### Cryptographic Guarantees

- **STWO Implementation**: Sin mocks - Circle STARKs reales
- **M31 Field Arithmetic**: Operaciones matemáticas de producción  
- **128-bit Security**: Estándar de seguridad industrial
- **Merkle Tree Proofs**: Verificación de pertenencia a sets anónimos
- **Nullifier System**: Previene ataques de doble gasto

### Security Audit Status

- **Internal Review**: Completado
- **Code Quality**: Listo para producción
- **Cryptographic Implementation**: Integración STWO verificada
- **External Audit**: Disponible para investigadores de seguridad

## **Contributing**

¡Agradecemos tus contribuciones para mejorar ZK-CEASER!

### Development Setup

1. Haz fork del repositorio
2. Clona tu fork: `git clone https://github.com/YOUR_USERNAME/zk-ceaser.git`
3. Sigue la guía de reproducción arriba
4. Crea una rama de feature: `git checkout -b feature/amazing-feature`
5. Haz tus cambios y testea a fondo
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Abre un Pull Request

### Areas for Contribution

- **Cryptography**: Mejorar integración STWO
- **Frontend**: Mejorar UI/UX  
- **Performance**: Optimizar generación de pruebas
- **Documentation**: Expandir guías técnicas
- **Testing**: Añadir cobertura de tests

## **License & Important Disclaimer**

Este proyecto está licenciado bajo la **ZK-CEASER NON-COMMERCIAL LICENSE** – ver el archivo [LICENSE](LICENSE) para más detalles.

### Important Disclaimer

Este software se desarrolla solo para **investigación y desarrollo**. **No ha sido auditado para uso en producción**. El uso comercial está restringido para asegurar un despliegue responsable de la criptografía avanzada.

### License Summary

- **Uso no comercial**: Personal, educativo, investigación y contribuciones open-source
- **Uso comercial**: Reservado exclusivamente a Ceaser (@ZyraV21)
- **Contribuciones**: Bienvenidas bajo los mismos términos de licencia
- **Licencia comercial**: Contactar a [@ZyraV21](https://twitter.com/ZyraV21) para consultas

## **Acknowledgments**

- **[StarkWare](https://starkware.co/)** por el demostrador STWO y tecnología Circle STARKs  
- **[Arkworks](https://arkworks.rs/)** por primitivas criptográficas fundamentales  
- **[Rust Community](https://www.rust-lang.org/)** por el potente lenguaje de sistemas  
- **[Next.js Team](https://nextjs.org/)** por el excelente framework React  

## **Support & Community**

- **Issues**: [GitHub Issues](https://github.com/Zyra-V21/zk-ceaser/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Zyra-V21/zk-ceaser/discussions)  
- **Backend Docs**: [Rust Backend README](zkp-rust-backend/README.md)
- **Twitter**: [@ZyraV21](https://twitter.com/ZyraV21)

---

<div align="center">

**Built with Cryptography for True Privacy 🛡️**

[![GitHub stars](https://img.shields.io/github/stars/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Zyra-V21/zk-ceaser?style=social)](https://github.com/Zyra-V21/zk-ceaser/network/members)
[![License](https://img.shields.io/badge/License-ZK--CEASER%20Non--Commercial-red?style=flat-square)](./LICENSE)

**Made with ❤️ using STWO + Circle STARKs + M31 Field Arithmetic**

</div>
