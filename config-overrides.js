// config-overrides.js

module.exports = function override(config, env) {
  // Aquí es donde harás tus modificaciones.
  // 'config' es el objeto de configuración de Webpack.
  // 'env' te dice si estás en 'development' o 'production'.

  console.log("¡Configuración de Webpack sobreescrita!");

  // Ejemplo: Añadir un fallback para el módulo 'crypto'.
  config.resolve.fallback = {
    ...config.resolve.fallback, // Mantén los fallbacks existentes si los hay
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify")

  };

  return config; // ¡Muy importante devolver la configuración modificada!
}
