// Módulo de Bisección - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html

let currentFunction = null
let currentChart = null
let resultChart = null

// Declare math variable to avoid undeclared variable error
// Intentar registrar el plugin de zoom/pan si fue cargado desde CDN
try {
  const possibleNames = [
    "chartjsPluginZoom",
    "ChartZoom",
    "chartjs_plugin_zoom",
    "chartjsPluginZoomGlobal",
    "ChartjsPluginZoom",
    "zoomPlugin",
  ]

  let zoomPlugin = null
  for (const name of possibleNames) {
    if (window[name]) {
      zoomPlugin = window[name]
      break
    }
  }

  if (!zoomPlugin) {
    // try some common globals
    zoomPlugin = window.chartjsPluginZoom || window.ChartZoom || window.Zoom || null
  }

  if (typeof Chart !== "undefined" && zoomPlugin && Chart.register) {
    try {
      Chart.register(zoomPlugin)
    } catch (e) {
      // if registration fails, plugin may auto-register
    }
  }
} catch (e) {
  // No crítico: el plugin puede auto-registrarse o no estar presente
}

// Remuestrear puntos en el rango visible (mejora resolución después de zoom/pan)
function resampleChartData(chart) {
  try {
    if (!chart || !currentFunction) return
    const xScale = chart.scales && (chart.scales.x || chart.scales[Object.keys(chart.scales)[0]])
    if (!xScale) return

    const xMin = typeof xScale.min === 'number' ? xScale.min : xScale.min === undefined ? xScale.min : xScale.left
    const xMax = typeof xScale.max === 'number' ? xScale.max : xScale.right
    // Fallback: use the configured full range if min/max are not accessible
    const fullMin = chart._fullRangeMin !== undefined ? chart._fullRangeMin : (xMin || -10)
    const fullMax = chart._fullRangeMax !== undefined ? chart._fullRangeMax : (xMax || 10)

    const low = (typeof xScale.min === 'number') ? xScale.min : fullMin
    const high = (typeof xScale.max === 'number') ? xScale.max : fullMax
    if (!isFinite(low) || !isFinite(high) || low >= high) return

    const range = high - low
    // Determine number of samples based on range (cap to avoid too many points)
    const samples = Math.min(1500, Math.max(200, Math.ceil(range * 200)))
    const step = range / samples

  const points = []
    for (let x = low; x <= high; x += step) {
      try {
        const y = currentFunction.evaluate({ x: x })
        if (isFinite(y)) points.push({ x: x, y: y })
      } catch (e) {
        // ignore
      }
    }

    // Replace only the main dataset (index 0)
    if (chart.data && chart.data.datasets && chart.data.datasets.length > 0) {
      chart.data.datasets[0].data = points
        console.log(`[v0] Remuestreado ${points.length} puntos para rango [${low.toFixed(4)}, ${high.toFixed(4)}]`)
      chart.update()
    }
  } catch (e) {
    // no-op on errors
  }
}

// Habilitar pan mediante arrastre con click izquierdo en el canvas
function enableDragPan(chart, canvas) {
  if (!chart || !canvas) return

  let dragging = false
  let startPixel = { x: 0, y: 0 }
  let startDomain = { xMin: null, xMax: null, yMin: null, yMax: null }

  function onDown(e) {
    // Solo botón izquierdo
    if (e.button !== 0) return
    dragging = true
    // Evitar que el navegador seleccione texto
    e.preventDefault()
    startPixel = { x: e.clientX, y: e.clientY }
    try {
      const xScale = chart.scales.x || chart.scales[Object.keys(chart.scales)[0]]
      const yScale = chart.scales.y || chart.scales[Object.keys(chart.scales)[1]]
      startDomain.xMin = xScale.min !== undefined ? xScale.min : xScale.getValueForPixel(xScale.left)
      startDomain.xMax = xScale.max !== undefined ? xScale.max : xScale.getValueForPixel(xScale.right)
      startDomain.yMin = yScale.min !== undefined ? yScale.min : yScale.getValueForPixel(yScale.bottom)
      startDomain.yMax = yScale.max !== undefined ? yScale.max : yScale.getValueForPixel(yScale.top)
    } catch (err) {
      // fallback, use stored full range
      startDomain.xMin = chart._fullRangeMin || -10
      startDomain.xMax = chart._fullRangeMax || 10
      startDomain.yMin = -10
      startDomain.yMax = 10
    }
  }

  function onMove(e) {
    if (!dragging) return
    e.preventDefault()
    try {
      const rect = canvas.getBoundingClientRect()
      const xScale = chart.scales.x || chart.scales[Object.keys(chart.scales)[0]]
      const yScale = chart.scales.y || chart.scales[Object.keys(chart.scales)[1]]

      const prevPixelX = startPixel.x - rect.left
      const currPixelX = e.clientX - rect.left
      const prevPixelY = startPixel.y - rect.top
      const currPixelY = e.clientY - rect.top

      const prevValX = xScale.getValueForPixel(prevPixelX)
      const currValX = xScale.getValueForPixel(currPixelX)
      const deltaX = prevValX - currValX

      const prevValY = yScale.getValueForPixel(prevPixelY)
      const currValY = yScale.getValueForPixel(currPixelY)
      const deltaY = prevValY - currValY

      // Apply deltas to domain
      const newXMin = startDomain.xMin + deltaX
      const newXMax = startDomain.xMax + deltaX
      const newYMin = startDomain.yMin + deltaY
      const newYMax = startDomain.yMax + deltaY

      // Set new limits
      if (xScale.options) {
        xScale.options.min = newXMin
        xScale.options.max = newXMax
      }
      if (yScale.options) {
        // Clamp Y to [-100, 100]
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
        const clampedMin = clamp(newYMin, -100, 100)
        const clampedMax = clamp(newYMax, -100, 100)
        // Only set if valid range
        if (clampedMin < clampedMax) {
          yScale.options.min = clampedMin
          yScale.options.max = clampedMax
        }
      }

      // Update chart without animation
      chart.update('none')
    } catch (err) {
      // ignore
    }
  }

  function onUp(e) {
    if (!dragging) return
    dragging = false
    // Después de soltar, remuestrear para mejorar resolución
    try { resampleChartData(chart) } catch (e) {}
  }

  // Attach listeners
  canvas.addEventListener('mousedown', onDown)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
  // Remove on chart destroy: keep a weak reference map would be better, but keep simple.
}

window.initializeBiseccion = () => {
  console.log("[v0] Inicializando módulo de bisección...")

  const graphBtn = document.getElementById("graph-btn")
  const methodBtn = document.getElementById("method-btn")
  const functionInput = document.getElementById("function-input")
  const resetZoomFuncBtn = document.getElementById("reset-zoom-func")
  const resetZoomResultBtn = document.getElementById("reset-zoom-result")

  console.log("[v0] Elementos encontrados:", { graphBtn, methodBtn, functionInput })

  if (!graphBtn || !methodBtn || !functionInput) {
    console.error("[v0] Error: No se encontraron todos los elementos necesarios")
    return
  }

  // Permitir Enter en el campo de función
  functionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      console.log("[v0] Enter presionado en input de función")
      graphBtn.click()
    }
  })

  // Botón Graficar
  graphBtn.addEventListener("click", () => {
    console.log("[v0] Botón Graficar presionado")
    const functionStr = functionInput.value.trim()
    console.log("[v0] Función ingresada:", functionStr)

    if (!functionStr) {
      alert("Por favor, introduce una función")
      return
    }

    try {
      // Verificar que math.js esté disponible
      if (typeof math === "undefined") {
        console.error("[v0] math.js no está disponible")
        alert("Error: La librería math.js no está cargada")
        return
      }

      console.log("[v0] Compilando función con math.js...")
      // Compilar la función usando math.js (disponible globalmente)
      currentFunction = math.compile(functionStr)

      // Probar la función
      const testValue = currentFunction.evaluate({ x: 0 })
      console.log("[v0] Función compilada exitosamente. f(0) =", testValue)

      // Mostrar sección de gráfico
      document.getElementById("graph-section").style.display = "block"
      document.getElementById("results-section").style.display = "none"

      // Graficar la función
      plotFunction()
    } catch (error) {
      console.error("[v0] Error al compilar función:", error)
      alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
    }
  })

  // Reset zoom buttons
  if (resetZoomFuncBtn) {
    resetZoomFuncBtn.addEventListener('click', () => {
      if (currentChart) {
        if (typeof currentChart.resetZoom === 'function') currentChart.resetZoom()
        else if (typeof currentChart.resetTransform === 'function') currentChart.resetTransform()
      }
    })
  }

  if (resetZoomResultBtn) {
    resetZoomResultBtn.addEventListener('click', () => {
      if (resultChart) {
        if (typeof resultChart.resetZoom === 'function') resultChart.resetZoom()
        else if (typeof resultChart.resetTransform === 'function') resultChart.resetTransform()
      }
    })
  }

  // Botón Usar método
  methodBtn.addEventListener("click", () => {
    console.log("[v0] Botón Usar método presionado")
    // Si el usuario no presionó "Graficar", intentar compilar la función ahora
    if (!currentFunction) {
      const functionStrAuto = functionInput.value.trim()
      if (!functionStrAuto) {
        alert("Por favor, introduce una función y presiona Graficar o Usar método")
        return
      }
      try {
        currentFunction = math.compile(functionStrAuto)
      } catch (err) {
        console.error('[v0] Error al compilar (auto) la función:', err)
        alert('Error en la función: ' + (err && err.message ? err.message : err))
        return
      }
    }

    const a = Number.parseFloat(document.getElementById("param-a").value)
    const b = Number.parseFloat(document.getElementById("param-b").value)
    const error = Number.parseFloat(document.getElementById("param-error").value)
    const maxIter = Number.parseInt(document.getElementById("param-max-iter").value)

    console.log("[v0] Parámetros:", { a, b, error, maxIter })

    // Validaciones
    if (isNaN(a) || isNaN(b)) {
      alert("Por favor, introduce valores válidos para a y b")
      return
    }

    if (a >= b) {
      alert("El valor de a debe ser menor que b")
      return
    }

    if (isNaN(error) || error <= 0) {
      alert("El error debe ser un número positivo")
      return
    }

    if (isNaN(maxIter) || maxIter < 1) {
      alert("El máximo de iteraciones debe ser al menos 1")
      return
    }

    try {
      // Evaluar f(a) y f(b)
      const fa = currentFunction.evaluate({ x: a })
      const fb = currentFunction.evaluate({ x: b })

      console.log("[v0] f(a) =", fa, ", f(b) =", fb)

      // Verificar que f(a) * f(b) < 0
      if (fa * fb > 0) {
        alert(
          "Error: f(a) · f(b) > 0\n\nNo se puede garantizar que exista una raíz en el intervalo [a, b].\nPor favor, elige otro intervalo.",
        )
        return
      }

      // Ejecutar el método de bisección
      const result = bisectionMethod(a, b, error, maxIter)
      console.log("[v0] Resultado del método:", result)

      // Mostrar resultados
      displayResults(result, a, b)
    } catch (error) {
      console.error("[v0] Error al ejecutar el método:", error)
      alert("Error al ejecutar el método: " + error.message)
    }
  })

  console.log("[v0] Módulo de bisección inicializado correctamente")
}

function plotFunction() {
  console.log("[v0] Graficando función...")
  const canvas = document.getElementById("function-chart")
  const ctx = canvas.getContext("2d")

  // Destruir gráfico anterior si existe
  if (currentChart) {
    currentChart.destroy()
  }

  // Generar puntos para graficar
  const points = []
  const xMin = -10
  const xMax = 10
  const step = 0.1

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunction.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  console.log("[v0] Puntos generados:", points.length)

  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("[v0] Chart.js no está disponible")
    alert("Error: La librería Chart.js no está cargada")
    return
  }

  // Crear gráfico usando Chart.js (disponible globalmente)
  currentChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "f(x)",
          data: points,
          borderColor: "#5b7cfa",
          backgroundColor: "rgba(91, 124, 250, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#e0e0e0",
          },
        },
        // Configuración de zoom/pan (requerido chartjs-plugin-zoom)
        zoom: {
          pan: {
            enabled: true,
            mode: "xy",
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
            // Callback después de zoom
            onZoom: ({ chart }) => {
              try { resampleChartData(chart) } catch (e) {}
            },
          },
          // Callback después de pan
          onPan: ({ chart }) => {
            try { resampleChartData(chart) } catch (e) {}
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "x",
            color: "#e0e0e0",
          },
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: (context) => {
              // Resaltar el eje Y (x = 0)
              return context.tick.value === 0 ? "#606060" : "#2a2a2a";
            },
            drawOnChartArea: true,
          },
        },
        y: {
          title: {
            display: true,
            text: "f(x)",
            color: "#e0e0e0",
          },
          // Limitar Y entre -100 y 100
          min: -100,
          max: 100,
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: (context) => {
              // Resaltar el eje X (y = 0)
              return context.tick.value === 0 ? "#606060" : "#2a2a2a";
            },
            drawOnChartArea: true,
          },
        },
      },
    },
  })

  // Guardar rango completo para remuestreo posterior
  try {
    currentChart._fullRangeMin = xMin
    currentChart._fullRangeMax = xMax
  } catch (e) {}

  // Habilitar panning con click izquierdo arrastrando
  try { enableDragPan(currentChart, canvas) } catch (e) {}

  console.log("[v0] Gráfico creado exitosamente")
}

function bisectionMethod(a, b, epsilon, maxIter) {
  console.log("[v0] Ejecutando método de bisección...")
  const iterations = []
  let ai = a
  let bi = b
  let i = 0

  while (i < maxIter) {
    i++
    const ci = (ai + bi) / 2
    const fci = currentFunction.evaluate({ x: ci })

    iterations.push({
      i: i,
      ai: ai,
      bi: bi,
      ci: ci,
      fci: fci,
    })

    console.log(`[v0] Iteración ${i}: c = ${ci}, f(c) = ${fci}`)

    // Verificar si encontramos la raíz o alcanzamos el error aceptable
    if (Math.abs(fci) <= epsilon) {
      console.log("[v0] Convergencia alcanzada")
      return {
        root: ci,
        iterations: iterations,
        converged: true,
      }
    }

    // Actualizar el intervalo
    const fai = currentFunction.evaluate({ x: ai })

    if (fai * fci < 0) {
      bi = ci
    } else {
      ai = ci
    }
  }

  // Si llegamos aquí, alcanzamos el máximo de iteraciones
  const finalC = (ai + bi) / 2
  console.log("[v0] Máximo de iteraciones alcanzado")
  return {
    root: finalC,
    iterations: iterations,
    converged: false,
  }
}

function displayResults(result, initialA, initialB) {
  console.log("[v0] Mostrando resultados...")
  document.getElementById("results-section").style.display = "block"

  // Llenar tabla de iteraciones
  const tbody = document.getElementById("iterations-body")
  tbody.innerHTML = ""

  result.iterations.forEach((iter) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td style="padding: 10px; text-align: center; border: 1px solid #3a3a3a;">${iter.i}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #3a3a3a;">${iter.ai.toFixed(10)}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #3a3a3a;">${iter.bi.toFixed(10)}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #3a3a3a;">${iter.ci.toFixed(10)}</td>
            <td style="padding: 10px; text-align: center; border: 1px solid #3a3a3a;">${iter.fci.toFixed(10)}</td>
        `
    tbody.appendChild(row)
  })

  // Mostrar resultado final
  document.getElementById("final-root").textContent = result.root.toFixed(10)
  document.getElementById("final-iterations").textContent = result.iterations.length
  document.getElementById("final-error").textContent = Math.abs(currentFunction.evaluate({ x: result.root })).toFixed(
    10,
  )

  // Graficar con la raíz
  plotFunctionWithRoot(result.root, initialA, initialB)
}

function plotFunctionWithRoot(root, a, b) {
  console.log("[v0] Graficando función con raíz...")
  const canvas = document.getElementById("result-chart")
  const ctx = canvas.getContext("2d")

  // Destruir gráfico anterior si existe
  if (resultChart) {
    resultChart.destroy()
  }

  // Generar puntos para graficar
  const points = []
  const xMin = Math.min(a, b) - 2
  const xMax = Math.max(a, b) + 2
  const step = (xMax - xMin) / 200

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunction.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  // Crear gráfico con puntos especiales
  resultChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "f(x)",
          data: points,
          borderColor: "#5b7cfa",
          backgroundColor: "rgba(91, 124, 250, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
        },
        {
          label: "Punto a",
          data: [{ x: a, y: currentFunction.evaluate({ x: a }) }],
          borderColor: "#ff6b6b",
          backgroundColor: "#ff6b6b",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Punto b",
          data: [{ x: b, y: currentFunction.evaluate({ x: b }) }],
          borderColor: "#ffd93d",
          backgroundColor: "#ffd93d",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Raíz aproximada",
          data: [{ x: root, y: currentFunction.evaluate({ x: root }) }],
          borderColor: "#6bcf7f",
          backgroundColor: "#6bcf7f",
          pointRadius: 10,
          pointStyle: "star",
          showLine: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#e0e0e0",
          },
        },
        // Habilitar zoom/pan en el gráfico de resultados
        zoom: {
          pan: {
            enabled: true,
            mode: "xy",
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
            // Callback después de zoom
            onZoom: ({ chart }) => {
              try { resampleChartData(chart) } catch (e) {}
            },
          },
          // Callback después de pan
          onPan: ({ chart }) => {
            try { resampleChartData(chart) } catch (e) {}
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "x",
            color: "#e0e0e0",
          },
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: (context) => {
              // Resaltar el eje Y (x = 0)
              return context.tick.value === 0 ? "#606060" : "#2a2a2a";
            },
            drawOnChartArea: true,
          },
        },
        y: {
          title: {
            display: true,
            text: "f(x)",
            color: "#e0e0e0",
          },
          // Limitar Y entre -100 y 100
          min: -100,
          max: 100,
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: (context) => {
              // Resaltar el eje X (y = 0)
              return context.tick.value === 0 ? "#606060" : "#2a2a2a";
            },
            drawOnChartArea: true,
          },
        },
      },
    },
  })

  // Guardar rango completo para remuestreo posterior
  try {
    resultChart._fullRangeMin = xMin
    resultChart._fullRangeMax = xMax
  } catch (e) {}

  console.log("[v0] Gráfico con raíz creado exitosamente")
}
