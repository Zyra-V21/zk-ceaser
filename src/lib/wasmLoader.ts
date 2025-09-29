// Modern WASM loader for Next.js 15.x following 2025 best practices

let wasmModuleCache: any = null;

export async function loadZKPWasm() {
  // Return cached module if already loaded
  if (wasmModuleCache) {
    console.log('✅ Using cached WASM module');
    return wasmModuleCache;
  }

  try {
    console.log('🔄 Loading WASM module (Next.js 15.x compatible)...');
    
    // Check WebAssembly support
    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported in this environment');
    }

    // Method 1: Dynamic import with proper error handling
    let wasmModule;
    try {
      console.log('📦 Attempting dynamic import...');
      wasmModule = await import('../../pkg/zkp_ceaser');
      
      // Initialize if needed (for bundler target)
      if (typeof wasmModule.default === 'function') {
        console.log('🔧 Initializing WASM module...');
        await wasmModule.default();
      }
      
      console.log('✅ WASM module loaded via dynamic import');
    } catch (importError) {
      console.log('⚠️ Dynamic import failed, trying alternative method...', importError);
      
      // Method 2: Manual WASM instantiation (fallback)
      try {
        console.log('🔧 Loading WASM manually...');
        const wasmResponse = await fetch('/pkg/zkp_ceaser_bg.wasm');
        
        if (!wasmResponse.ok) {
          throw new Error(`Failed to fetch WASM: ${wasmResponse.status}`);
        }
        
        const wasmBytes = await wasmResponse.arrayBuffer();
        const wasmInstance = await WebAssembly.instantiate(wasmBytes);
        
        // Load JS wrapper
        const jsWrapper = await import('../../pkg/zkp_ceaser_bg.js');
        wasmModule = { ...jsWrapper, wasmInstance };
        
        console.log('✅ WASM loaded via manual instantiation');
      } catch (manualError) {
        console.error('❌ All WASM loading methods failed');
        throw new Error(`WASM loading failed: ${manualError}`);
      }
    }

    // Validate the loaded module
    console.log('🔍 Validating WASM module...');
    const availableFunctions = Object.keys(wasmModule).filter(key => 
      typeof wasmModule[key] === 'function'
    );
    
    console.log('📋 Available functions:', availableFunctions);
    
    // Check for required functions
    const requiredFunctions = [
      'generate_ceaser_zk_proof',
      'verify_ceaser_zk_proof', 
      'get_zkp_performance_stats'
    ];
    
    const missingFunctions = requiredFunctions.filter(fn => 
      typeof wasmModule[fn] !== 'function'
    );
    
    if (missingFunctions.length > 0) {
      throw new Error(`Missing required functions: ${missingFunctions.join(', ')}`);
    }
    
    console.log('✅ All required functions present');
    
    // Test the module with a quick call
    try {
      const statsJson = wasmModule.get_zkp_performance_stats();
      const stats = JSON.parse(statsJson);
      console.log('📊 WASM module test successful:', stats);
      
      // Verify it's the real module (not mock)
      if (stats.library_used && !stats.library_used.includes('Mock')) {
        console.log('🎉 REAL WASM module loaded successfully!');
        console.log('🔐 ZK proofs will be generated using:', stats.library_used);
      } else {
        console.warn('⚠️ Loaded module appears to be a mock');
      }
    } catch (testError) {
      console.warn('⚠️ WASM module test failed:', testError);
    }
    
    // Cache the module
    wasmModuleCache = wasmModule;
    return wasmModule;
    
  } catch (error) {
    console.error('❌ Failed to load WASM module:', error);
    throw error;
  }
}

// Utility functions
export function isWasmSupported(): boolean {
  return (
    typeof WebAssembly !== 'undefined' && 
    typeof WebAssembly.instantiate === 'function' &&
    typeof WebAssembly.Module !== 'undefined'
  );
}

export function getWasmDebugInfo() {
  return {
    wasmSupported: isWasmSupported(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
    location: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    nodeEnv: process.env.NODE_ENV || 'Unknown',
    nextVersion: '15.5.3',
    webAssemblyFeatures: {
      streaming: typeof WebAssembly.instantiateStreaming === 'function',
      threads: typeof SharedArrayBuffer !== 'undefined',
      simd: typeof WebAssembly.validate === 'function',
    }
  };
}

// Clear cache function (useful for development)
export function clearWasmCache() {
  wasmModuleCache = null;
  console.log('🧹 WASM module cache cleared');
}