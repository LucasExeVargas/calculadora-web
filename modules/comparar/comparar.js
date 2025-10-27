// Módulo de Comparación - Compara dos métodos numéricos
;(() => {
  let currentFunctionComparar = null
  let currentGFunctionComparar = null
  let currentDerivativeComparar = null
  let currentSecondDerivativeComparar = null
  const math = window.math

  const methodConfigs = {
    biseccion: {
      name: "Bisección",
      description: "Encuentra raíces de funciones mediante el método de bisección",
      params: [
        { id: "a", label: "Valor de a (inicio del intervalo)", type: "number", placeholder: "Ej: 0" },
        { id: "b", label: "Valor de b (fin del intervalo)", type: "number", placeholder: "Ej: 2" },
      ],
    },
    newton: {
      name: "Newton-Raphson",
      description: "Encuentra raíces de funciones mediante el método de Newton-Raphson",
      params: [{ id: "x0", label: "Valor inicial X₀", type: "number", placeholder: "Ej: 1" }],
    },
    secante: {
      name: "Secante",
      description: "Encuentra raíces de funciones mediante el método de la secante",
      params: [
        { id: "x0", label: "Valor inicial X₀", type: "number", placeholder: "Ej: 1" },
        { id: "x1", label: "Valor inicial X₁", type: "number", placeholder: "Ej: 2" },
      ],
    },
    "punto-fijo": {
      name: "Punto Fijo",
      description: "Encuentra raíces mediante el método de punto fijo",
      params: [
        { id: "g", label: "Función g(x)", type: "text", placeholder: "Ej: sqrt(x + 1)" },
        { id: "a", label: "Valor de a (inicio del intervalo)", type: "number", placeholder: "Ej: 0" },
        { id: "b", label: "Valor de b (fin del intervalo)", type: "number", placeholder: "Ej: 3" },
        { id: "x0", label: "Valor inicial X₀", type: "number", placeholder: "Ej: 2" },
      ],
    },
    "regula-falsi": {
      name: "Regula Falsi",
      description: "Encuentra raíces de funciones mediante el método de Regula Falsi",
      params: [
        { id: "a", label: "Valor de a (inicio del intervalo)", type: "number", placeholder: "Ej: 0" },
        { id: "b", label: "Valor de b (fin del intervalo)", type: "number", placeholder: "Ej: 2" },
      ],
    },
    "regula-falsi-modificada": {
      name: "Regula Falsi Modificada",
      description: "Encuentra raíces de funciones mediante el método de Regula Falsi Modificada",
      params: [
        { id: "a", label: "Valor de a (inicio del intervalo)", type: "number", placeholder: "Ej: 0" },
        { id: "b", label: "Valor de b (fin del intervalo)", type: "number", placeholder: "Ej: 2" },
      ],
    },
  }

  window.initializeComparar = () => {
    console.log("[v0] Inicializando módulo de Comparación...")

    const method1Select = document.getElementById("method1-select")
    const method2Select = document.getElementById("method2-select")
    const graphBtn = document.getElementById("graph-btn-comparar")
    const compareBtn = document.getElementById("compare-btn")
    const functionInput = document.getElementById("function-input-comparar")

    if (!method1Select || !method2Select || !graphBtn || !compareBtn || !functionInput) {
      console.error("[v0] Error: No se encontraron todos los elementos necesarios")
      return
    }

    // Botón Graficar
    graphBtn.addEventListener("click", () => {
      const method1 = method1Select.value
      const method2 = method2Select.value
      const functionStr = functionInput.value.trim()

      if (!method1 || !method2) {
        alert("Por favor, selecciona ambos métodos")
        return
      }

      if (method1 === method2) {
        alert("Por favor, selecciona dos métodos diferentes")
        return
      }

      if (!functionStr) {
        alert("Por favor, introduce una función")
        return
      }

      try {
        currentFunctionComparar = math.compile(functionStr)

        // Calcular derivada para Newton-Raphson si es necesario
        if (method1 === "newton" || method2 === "newton") {
          const node = math.parse(functionStr)
          const derivativeNode = math.derivative(node, "x")
          const secondDerivativeNode = math.derivative(derivativeNode, "x")
          currentDerivativeComparar = derivativeNode.compile()
          currentSecondDerivativeComparar = secondDerivativeNode.compile()
        }

        const testValue = currentFunctionComparar.evaluate({ x: 0 })

        // Mostrar parámetros
        setupMethodParameters(method1, method2)
        document.getElementById("parameters-section-comparar").style.display = "block"
        document.getElementById("results-section-comparar").style.display = "none"
      } catch (error) {
        alert("Error en la función: " + error.message)
      }
    })

    // Botón Comparar
    compareBtn.addEventListener("click", () => {
      const method1 = method1Select.value
      const method2 = method2Select.value
      const sharedError = Number.parseFloat(document.getElementById("shared-error").value)
      const sharedMaxIter = Number.parseInt(document.getElementById("shared-max-iter").value)

      if (isNaN(sharedError) || sharedError <= 0) {
        alert("El error debe ser un número positivo")
        return
      }

      if (isNaN(sharedMaxIter) || sharedMaxIter < 1) {
        alert("El máximo de iteraciones debe ser al menos 1")
        return
      }

      try {
        const params1 = getMethodParameters(1, method1)
        const params2 = getMethodParameters(2, method2)

        const result1 = executeMethod(method1, params1, sharedError, sharedMaxIter)
        const result2 = executeMethod(method2, params2, sharedError, sharedMaxIter)

        displayComparisonResults(method1, method2, result1, result2)
      } catch (error) {
        alert("Error al ejecutar los métodos: " + error.message)
      }
    })

    console.log("[v0] Módulo de Comparación inicializado correctamente")
  }

  function setupMethodParameters(method1, method2) {
    const config1 = methodConfigs[method1]
    const config2 = methodConfigs[method2]

    document.getElementById("method1-title").textContent = config1.name
    document.getElementById("method1-description").textContent = config1.description
    document.getElementById("method2-title").textContent = config2.name
    document.getElementById("method2-description").textContent = config2.description

    const inputs1 = document.getElementById("method1-inputs")
    const inputs2 = document.getElementById("method2-inputs")

    inputs1.innerHTML = ""
    inputs2.innerHTML = ""

    config1.params.forEach((param) => {
      const div = document.createElement("div")
      div.style.marginBottom = "15px"
      div.innerHTML = `
        <label style="display: block; margin-bottom: 8px; color: #e0e0e0;">${param.label}</label>
        <input
          type="${param.type}"
          id="method1-${param.id}"
          placeholder="${param.placeholder}"
          ${param.type === "number" ? 'step="0.01"' : ""}
          style="width: 100%; padding: 12px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 8px; color: #e0e0e0;"
        />
      `
      inputs1.appendChild(div)
    })

    config2.params.forEach((param) => {
      const div = document.createElement("div")
      div.style.marginBottom = "15px"
      div.innerHTML = `
        <label style="display: block; margin-bottom: 8px; color: #e0e0e0;">${param.label}</label>
        <input
          type="${param.type}"
          id="method2-${param.id}"
          placeholder="${param.placeholder}"
          ${param.type === "number" ? 'step="0.01"' : ""}
          style="width: 100%; padding: 12px; background: #2a2a2a; border: 1px solid #3a3a3a; border-radius: 8px; color: #e0e0e0;"
        />
      `
      inputs2.appendChild(div)
    })
  }

  function getMethodParameters(methodNum, methodType) {
    const config = methodConfigs[methodType]
    const params = {}

    config.params.forEach((param) => {
      const input = document.getElementById(`method${methodNum}-${param.id}`)
      if (!input) return

      if (param.type === "number") {
        params[param.id] = Number.parseFloat(input.value)
        if (isNaN(params[param.id])) {
          throw new Error(`Por favor, introduce un valor válido para ${param.label}`)
        }
      } else {
        params[param.id] = input.value.trim()
        if (!params[param.id]) {
          throw new Error(`Por favor, introduce un valor para ${param.label}`)
        }
      }
    })

    return params
  }

  function executeMethod(methodType, params, epsilon, maxIter) {
    switch (methodType) {
      case "biseccion":
        return executeBiseccion(params.a, params.b, epsilon, maxIter)
      case "newton":
        return executeNewton(params.x0, epsilon, maxIter)
      case "secante":
        return executeSecante(params.x0, params.x1, epsilon, maxIter)
      case "punto-fijo":
        return executePuntoFijo(params.g, params.a, params.b, params.x0, epsilon, maxIter)
      case "regula-falsi":
        return executeRegulaFalsi(params.a, params.b, epsilon, maxIter)
      case "regula-falsi-modificada":
        return executeRegulaFalsiModificada(params.a, params.b, epsilon, maxIter)
      default:
        throw new Error("Método no reconocido")
    }
  }

  function executeBiseccion(a, b, epsilon, maxIter) {
    const iterations = []
    let ai = a
    let bi = b
    let i = 0

    const fa = currentFunctionComparar.evaluate({ x: a })
    const fb = currentFunctionComparar.evaluate({ x: b })

    if (fa * fb > 0) {
      throw new Error("No existe una raíz en el intervalo [a, b] según el método de Bisección")
    }

    while (i < maxIter) {
      i++
      const fai = currentFunctionComparar.evaluate({ x: ai })
      const fbi = currentFunctionComparar.evaluate({ x: bi })
      const ci = (ai + bi) / 2
      const fci = currentFunctionComparar.evaluate({ x: ci })

      iterations.push({ i, ai, bi, ci, fci })

      if (Math.abs(fci) <= epsilon) {
        return { root: ci, iterations, converged: true, finalError: Math.abs(fci) }
      }

      if (fai * fci < 0) {
        bi = ci
      } else {
        ai = ci
      }
    }

    const finalC = (ai + bi) / 2
    return {
      root: finalC,
      iterations,
      converged: false,
      finalError: Math.abs(currentFunctionComparar.evaluate({ x: finalC })),
    }
  }

  function executeNewton(x0, epsilon, maxIter) {
    const iterations = []
    let xi = x0
    let i = 0

    while (i < maxIter) {
      i++
      const fxi = currentFunctionComparar.evaluate({ x: xi })
      const fpxi = currentDerivativeComparar.evaluate({ x: xi })

      if (Math.abs(fpxi) < 1e-10) {
        throw new Error("La derivada es muy cercana a cero")
      }

      const xi1 = xi - fxi / fpxi
      iterations.push({ i, xi, fxi, fpxi, xi1 })

      if (Math.abs(xi1 - xi) < epsilon) {
        return {
          root: xi1,
          iterations,
          converged: true,
          finalError: Math.abs(currentFunctionComparar.evaluate({ x: xi1 })),
        }
      }

      xi = xi1
    }

    return { root: xi, iterations, converged: false, finalError: Math.abs(currentFunctionComparar.evaluate({ x: xi })) }
  }

  function executeSecante(x0, x1, epsilon, maxIter) {
    const iterations = []
    let xn_1 = x0
    let xn = x1
    let i = 0

    while (i < maxIter) {
      i++
      const fxn_1 = currentFunctionComparar.evaluate({ x: xn_1 })
      const fxn = currentFunctionComparar.evaluate({ x: xn })

      if (Math.abs(fxn - fxn_1) < 1e-10) {
        throw new Error("El denominador es muy cercano a cero")
      }

      const xn1 = (xn_1 * fxn - xn * fxn_1) / (fxn - fxn_1)
      const fxn1 = currentFunctionComparar.evaluate({ x: xn1 })
      const error = Math.abs(xn1 - xn)

      iterations.push({ i, xn_1, xn, xn1, fxn1, error })

      if (error < epsilon) {
        return { root: xn1, iterations, converged: true, finalError: Math.abs(fxn1) }
      }

      xn_1 = xn
      xn = xn1
    }

    return { root: xn, iterations, converged: false, finalError: Math.abs(currentFunctionComparar.evaluate({ x: xn })) }
  }

  function executePuntoFijo(gStr, a, b, x0, epsilon, maxIter) {
    currentGFunctionComparar = math.compile(gStr)

    if (x0 < a || x0 > b) {
      throw new Error("X₀ debe estar dentro del intervalo [a, b]")
    }

    const iterations = []
    let xi = x0
    let i = 0

    // Primera iteración con i=0
    const fx0 = currentFunctionComparar.evaluate({ x: x0 })
    iterations.push({ i: 0, xi: x0, fxi: fx0, error: null })

    while (i < maxIter) {
      i++
      const xi1 = currentGFunctionComparar.evaluate({ x: xi })
      const fxi1 = currentFunctionComparar.evaluate({ x: xi1 })
      const error = Math.abs(xi1 - xi)

      iterations.push({ i, xi: xi1, fxi: fxi1, error })

      if (error < epsilon) {
        return { root: xi1, iterations, converged: true, finalError: Math.abs(fxi1) }
      }

      xi = xi1
    }

    return { root: xi, iterations, converged: false, finalError: Math.abs(currentFunctionComparar.evaluate({ x: xi })) }
  }

  function executeRegulaFalsi(a, b, epsilon, maxIter) {
    const iterations = []
    let ai = a
    let bi = b
    let i = 0

    const fa = currentFunctionComparar.evaluate({ x: a })
    const fb = currentFunctionComparar.evaluate({ x: b })

    if (fa * fb > 0) {
      throw new Error("No existe una raíz en el intervalo [a, b] según el método de Regula Falsi")
    }

    while (i < maxIter) {
      i++
      const fai = currentFunctionComparar.evaluate({ x: ai })
      const fbi = currentFunctionComparar.evaluate({ x: bi })
      const ci = (ai * fbi - bi * fai) / (fbi - fai)
      const fci = currentFunctionComparar.evaluate({ x: ci })

      iterations.push({ i, ai, bi, ci, fci })

      if (Math.abs(fci) <= epsilon) {
        return { root: ci, iterations, converged: true, finalError: Math.abs(fci) }
      }

      if (fai * fci < 0) {
        bi = ci
      } else {
        ai = ci
      }
    }

    const finalC =
      (ai * currentFunctionComparar.evaluate({ x: bi }) - bi * currentFunctionComparar.evaluate({ x: ai })) /
      (currentFunctionComparar.evaluate({ x: bi }) - currentFunctionComparar.evaluate({ x: ai }))
    return {
      root: finalC,
      iterations,
      converged: false,
      finalError: Math.abs(currentFunctionComparar.evaluate({ x: finalC })),
    }
  }

  function executeRegulaFalsiModificada(a, b, epsilon, maxIter) {
    const iterations = []
    let ai = a
    let bi = b
    let i = 0

    const fa = currentFunctionComparar.evaluate({ x: a })
    const fb = currentFunctionComparar.evaluate({ x: b })

    if (fa * fb > 0) {
      throw new Error("No existe una raíz en el intervalo [a, b] según el método de Regula Falsi Modificada")
    }

    let F = fa
    let G = fb
    let w = fa

    while (i < maxIter) {
      i++
      const fai = currentFunctionComparar.evaluate({ x: ai })
      const fbi = currentFunctionComparar.evaluate({ x: bi })
      const ci = (ai * G - bi * F) / (G - F)
      const fci = currentFunctionComparar.evaluate({ x: ci })

      iterations.push({ i, ai, bi, ci, fci })

      if (Math.abs(fci) <= epsilon) {
        return { root: ci, iterations, converged: true, finalError: Math.abs(fci) }
      }

      if (fai * fci < 0) {
        bi = ci
        G = fci
        if (w * G > 0) {
          F = F / 2
        }
      } else {
        ai = ci
        F = fci
        if (w * F > 0) {
          G = G / 2
        }
      }

      w = fci
    }

    const fai = currentFunctionComparar.evaluate({ x: ai })
    const fbi = currentFunctionComparar.evaluate({ x: bi })
    const finalC = (ai * G - bi * F) / (G - F)
    return {
      root: finalC,
      iterations,
      converged: false,
      finalError: Math.abs(currentFunctionComparar.evaluate({ x: finalC })),
    }
  }

  function displayComparisonResults(method1, method2, result1, result2) {
    document.getElementById("results-section-comparar").style.display = "block"

    // Resultado 1
    document.getElementById("result1-title").textContent = methodConfigs[method1].name
    const content1 = document.getElementById("result1-content")
    content1.innerHTML = `
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Raíz aproximada:</strong> 
        <span style="color: #6bcf7f; font-size: 18px; font-weight: 600;">${result1.root.toFixed(10)}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Iteraciones:</strong> 
        <span style="color: #e0e0e0;">${result1.iterations.length}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Error final:</strong> 
        <span style="color: #e0e0e0;">${result1.finalError.toFixed(10)}</span>
      </div>
      <div>
        <strong style="color: #5b7cfa;">Convergió:</strong> 
        <span style="color: ${result1.converged ? "#6bcf7f" : "#ff6b6b"};">${result1.converged ? "Sí" : "No"}</span>
      </div>
    `

    // Resultado 2
    document.getElementById("result2-title").textContent = methodConfigs[method2].name
    const content2 = document.getElementById("result2-content")
    content2.innerHTML = `
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Raíz aproximada:</strong> 
        <span style="color: #6bcf7f; font-size: 18px; font-weight: 600;">${result2.root.toFixed(10)}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Iteraciones:</strong> 
        <span style="color: #e0e0e0;">${result2.iterations.length}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #5b7cfa;">Error final:</strong> 
        <span style="color: #e0e0e0;">${result2.finalError.toFixed(10)}</span>
      </div>
      <div>
        <strong style="color: #5b7cfa;">Convergió:</strong> 
        <span style="color: ${result2.converged ? "#6bcf7f" : "#ff6b6b"};">${result2.converged ? "Sí" : "No"}</span>
      </div>
    `

    // Resumen de comparación
    const summary = document.getElementById("comparison-summary")
    let summaryHTML = '<div style="text-align: center;">'

    // Comparar iteraciones
    if (result1.iterations.length < result2.iterations.length) {
      summaryHTML += `<p><strong>🏆 ${methodConfigs[method1].name}</strong> usó menos iteraciones (${result1.iterations.length} vs ${result2.iterations.length})</p>`
    } else if (result2.iterations.length < result1.iterations.length) {
      summaryHTML += `<p><strong>🏆 ${methodConfigs[method2].name}</strong> usó menos iteraciones (${result2.iterations.length} vs ${result1.iterations.length})</p>`
    } else {
      summaryHTML += `<p>Ambos métodos usaron la misma cantidad de iteraciones (${result1.iterations.length})</p>`
    }

    // Comparar precisión
    if (result1.finalError < result2.finalError) {
      summaryHTML += `<p><strong>🎯 ${methodConfigs[method1].name}</strong> es más preciso (error: ${result1.finalError.toFixed(10)} vs ${result2.finalError.toFixed(10)})</p>`
    } else if (result2.finalError < result1.finalError) {
      summaryHTML += `<p><strong>🎯 ${methodConfigs[method2].name}</strong> es más preciso (error: ${result2.finalError.toFixed(10)} vs ${result1.finalError.toFixed(10)})</p>`
    } else {
      summaryHTML += `<p>Ambos métodos tienen la misma precisión</p>`
    }

    summaryHTML += "</div>"
    summary.innerHTML = summaryHTML

    // Scroll to results
    document.getElementById("results-section-comparar").scrollIntoView({ behavior: "smooth" })
  }
})()
