// Módulo de Regula Falsi - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html
(function() {
let currentFunctionRF = null
let currentChartRF = null
let resultChartRF = null

// Importación de math.js y Chart.js
window.initializeRegulaFalsi = () => {
  console.log("[v0] Inicializando módulo de Regula Falsi...")

  const graphBtn = document.getElementById("graph-btn-rf")
  const methodBtn = document.getElementById("method-btn-rf")
  const functionInput = document.getElementById("function-input-rf")
  const resetZoomFunc = document.getElementById("reset-zoom-func-rf")
  const resetZoomResult = document.getElementById("reset-zoom-result-rf")

  if (!graphBtn || !methodBtn || !functionInput) {
    console.error("[v0] Error: No se encontraron todos los elementos necesarios")
    return
  }

  // Permitir Enter en el campo de función
  functionInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      graphBtn.click()
    }
  })

  // Botón Graficar
  graphBtn.addEventListener("click", () => {
    const functionStr = functionInput.value.trim()

    if (!functionStr) {
      alert("Por favor, introduce una función")
      return
    }

    try {
      if (typeof math === "undefined") {
        alert("Error: La librería math.js no está cargada")
        return
      }

      currentFunctionRF = math.compile(functionStr)
      const testValue = currentFunctionRF.evaluate({ x: 0 })

      document.getElementById("graph-section-rf").style.display = "block"
      document.getElementById("results-section-rf").style.display = "none"

      plotFunctionRF()
    } catch (error) {
      alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
    }
  })

  // Botones Caso de prueba (auto-fill y ejecutar) — tres niveles: fácil/medio/difícil
  const testEasyBtn = document.getElementById("test-easy-rf")
  const testMediumBtn = document.getElementById("test-medium-rf")
  const testHardBtn = document.getElementById("test-hard-rf")

  function setupAndRunRF(funcStr, a, b, errorVal, maxIter = 100) {
    functionInput.value = funcStr
    document.getElementById("param-a-rf").value = String(a)
    document.getElementById("param-b-rf").value = String(b)
    document.getElementById("param-error-rf").value = String(errorVal)
    document.getElementById("param-max-iter-rf").value = String(maxIter)

    // Graficar
    graphBtn.click()

    // Ejecutar método después de un corto retardo
    setTimeout(() => {
      methodBtn.click()
    }, 300)
  }

  if (testEasyBtn) {
    // Caso de Prueba 1 (Fácil)
    testEasyBtn.addEventListener("click", () => {
      setupAndRunRF("x^2 - 4", 1, 3, 0.001)
    })
  }

  if (testMediumBtn) {
    // Caso de Prueba 2 (Medio)
    testMediumBtn.addEventListener("click", () => {
      setupAndRunRF("x^3 - 2*x - 5", 2, 3, 0.0001)
    })
  }

  if (testHardBtn) {
    // Caso de Prueba 3 (Difícil)
    testHardBtn.addEventListener("click", () => {
      setupAndRunRF("e^(-x) - cos(x)", 1, 2, 0.00001)
    })
  }

  // Botón Usar método
  methodBtn.addEventListener("click", () => {
    const a = Number.parseFloat(document.getElementById("param-a-rf").value)
    const b = Number.parseFloat(document.getElementById("param-b-rf").value)
    const error = Number.parseFloat(document.getElementById("param-error-rf").value)
    const maxIter = Number.parseInt(document.getElementById("param-max-iter-rf").value)

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
      const fa = currentFunctionRF.evaluate({ x: a })
      const fb = currentFunctionRF.evaluate({ x: b })

      if (fa * fb > 0) {
        alert(
          "Error: f(a) · f(b) > 0\n\nNo existe una raíz en el intervalo [a, b] según el método de Regula Falsi.\nPor favor, elige otro intervalo.",
        )
        return
      }

      const result = regulaFalsiMethod(a, b, error, maxIter)
      displayResultsRF(result, a, b)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  })

  // Botones de reset zoom
  if (resetZoomFunc) {
    resetZoomFunc.addEventListener("click", () => {
      if (currentChartRF) {
        currentChartRF.resetZoom()
      }
    })
  }

  if (resetZoomResult) {
    resetZoomResult.addEventListener("click", () => {
      if (resultChartRF) {
        resultChartRF.resetZoom()
      }
    })
  }

  console.log("[v0] Módulo de Regula Falsi inicializado correctamente")
}

function plotFunctionRF() {
  const canvas = document.getElementById("function-chart-rf")
  const ctx = canvas.getContext("2d")

  if (currentChartRF) {
    currentChartRF.destroy()
  }

  const points = []
  const xMin = -50
  const xMax = 50
  const step = 0.5

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRF.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  if (typeof Chart === "undefined") {
    alert("Error: La librería Chart.js no está cargada")
    return
  }

  currentChartRF = new Chart(ctx, {
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
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: "#e0e0e0",
          },
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
            onZoom: ({chart}) => {
              try {
                resampleChartRF(chart)
              } catch (e) {
                console.error('[v0] Error remuestreando al hacer zoom:', e)
              }
            },
            onPan: ({chart}) => {
              try {
                resampleChartRF(chart)
              } catch (e) {
                console.error('[v0] Error remuestreando al hacer pan:', e)
              }
            },
          },
          pan: {
            enabled: true,
            mode: "xy",
            modifierKey: null,
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
          min: -50,
          max: 50,
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: "#2a2a2a",
          },
        },
        y: {
          title: {
            display: true,
            text: "f(x)",
            color: "#e0e0e0",
          },
          min: -50,
          max: 50,
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: "#2a2a2a",
          },
        },
      },
      onHover: (event, elements) => {
        const canvas = event.native?.target;
        if (canvas && !isDragging) {
          canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
        }
      },
      events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
    },
  })

  addDragPanFunctionalityRF(currentChartRF)
}

function plotFunctionWithRootRF(root, a, b) {
  const canvas = document.getElementById("result-chart-rf")
  const ctx = canvas.getContext("2d")

  if (resultChartRF) {
    resultChartRF.destroy()
  }

  const points = []
  const xMin = Math.max(Math.min(a, b) - 2)
  const xMax = Math.min(Math.max(a, b) + 2)
  const step = (xMax - xMin) / 200

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRF.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  resultChartRF = new Chart(ctx, {
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
          data: [{ x: a, y: currentFunctionRF.evaluate({ x: a }) }],
          borderColor: "#ff6b6b",
          backgroundColor: "#ff6b6b",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Punto b",
          data: [{ x: b, y: currentFunctionRF.evaluate({ x: b }) }],
          borderColor: "#ffd93d",
          backgroundColor: "#ffd93d",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Raíz aproximada",
          data: [{ x: root, y: currentFunctionRF.evaluate({ x: root }) }],
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
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: "#e0e0e0",
          },
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
            onZoom: ({chart}) => {
              try {
                resampleChartRF(chart)
              } catch (e) {
                console.error('[v0] Error remuestreando resultado al hacer zoom:', e)
              }
            },
            onPan: ({chart}) => {
              try {
                resampleChartRF(chart)
              } catch (e) {
                console.error('[v0] Error remuestreando resultado al hacer pan:', e)
              }
            },
          },
          pan: {
            enabled: true,
            mode: "xy",
            modifierKey: null,
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
            color: "#2a2a2a",
          },
        },
        y: {
          title: {
            display: true,
            text: "f(x)",
            color: "#e0e0e0",
          },
          ticks: {
            color: "#b0b0b0",
          },
          grid: {
            color: "#2a2a2a",
          },
        },
      },
      onHover: (event, elements) => {
        const canvas = event.native?.target;
        if (canvas && !isDragging) {
          canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
        }
      },
      events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
    },
  })

  addDragPanFunctionalityRF(resultChartRF)
}

function addDragPanFunctionalityRF(chart) {
  let isDragging = false
  let lastX = 0
  let lastY = 0

  const canvas = chart.canvas

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    canvas.style.cursor = 'grabbing'
  })

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastX
    const deltaY = e.clientY - lastY

    if (deltaX !== 0 || deltaY !== 0) {
      const xScale = chart.scales.x
      const yScale = chart.scales.y

      if (xScale && yScale) {
        const pixelRangeX = xScale.max - xScale.min
        const pixelRangeY = yScale.max - yScale.min
        
        const canvasWidth = chart.width
        const canvasHeight = chart.height

        // Eje X: comportamiento normal (derecha = derecha, izquierda = izquierda)
        const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
        
        // Eje Y: COMPORTAMIENTO INVERTIDO (arriba = sube, abajo = baja)
        const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * -1

        // Actualizar límites del eje X (comportamiento normal)
        chart.options.scales.x.min += deltaUnitsX
        chart.options.scales.x.max += deltaUnitsX
        
        // Actualizar límites del eje Y (COMPORTAMIENTO INVERTIDO)
        chart.options.scales.y.min -= deltaUnitsY  // Invertido: usar -
        chart.options.scales.y.max -= deltaUnitsY  // Invertido: usar -

        chart.update()

        setTimeout(() => {
          resampleChartRF(chart)
        }, 50)
      }
    }

    lastX = e.clientX
    lastY = e.clientY
  })

  canvas.addEventListener('mouseup', () => {
    isDragging = false
    canvas.style.cursor = 'grab'
  })

  canvas.addEventListener('mouseleave', (e) => {
    isDragging = false
    canvas.style.cursor = 'default'
    
    if (e.relatedTarget) {
      e.relatedTarget.style.cursor = 'default'
    }
  })

  canvas.addEventListener('mouseenter', () => {
    if (!isDragging) {
      canvas.style.cursor = 'grab'
    }
  })

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true
      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
      canvas.style.cursor = 'grabbing'
      e.preventDefault()
    }
  })

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return

    const deltaX = e.touches[0].clientX - lastX
    const deltaY = e.touches[0].clientY - lastY

    if (deltaX !== 0 || deltaY !== 0) {
      const xScale = chart.scales.x
      const yScale = chart.scales.y

      if (xScale && yScale) {
        const pixelRangeX = xScale.max - xScale.min
        const pixelRangeY = yScale.max - yScale.min
        
        const canvasWidth = chart.width
        const canvasHeight = chart.height

        // Eje X: comportamiento normal
        const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
        
        // Eje Y: COMPORTAMIENTO INVERTIDO
        const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * 1

        chart.options.scales.x.min += deltaUnitsX
        chart.options.scales.x.max += deltaUnitsX
        chart.options.scales.y.min -= deltaUnitsY  // Invertido: usar -
        chart.options.scales.y.max -= deltaUnitsY  // Invertido: usar -

        chart.update()

        setTimeout(() => {
          resampleChartRF(chart)
        }, 50)
      }
    }

    lastX = e.touches[0].clientX
    lastY = e.touches[0].clientY
    e.preventDefault()
  })

  canvas.addEventListener('touchend', () => {
    isDragging = false
    canvas.style.cursor = 'grab'
  })

  canvas.addEventListener('touchcancel', () => {
    isDragging = false
    canvas.style.cursor = 'default'
  })
}

function resampleChartRF(chart) {
  if (!chart || !currentFunctionRF) return
  const xScale = chart.scales && chart.scales.x
  if (!xScale) return
  let xMin = typeof xScale.min === 'number' ? xScale.min : -50
  let xMax = typeof xScale.max === 'number' ? xScale.max : 50

  if (!isFinite(xMin) || !isFinite(xMax) || xMin === xMax) {
    return
  }

  const samples = 500
  const step = (xMax - xMin) / samples
  const points = []
  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRF.evaluate({ x: x })
      if (isFinite(y)) points.push({ x: x, y: y })
    } catch (e) {
      // ignorar
    }
  }

  if (chart.data && chart.data.datasets && chart.data.datasets.length) {
    chart.data.datasets[0].data = points
    chart.update('none')
  }
}

function regulaFalsiMethod(a, b, epsilon, maxIter) {
  const iterations = []
  let ai = a
  let bi = b
  let i = 0

  while (i < maxIter) {
    i++

    // Calcular f(a) y f(b)
    const fai = currentFunctionRF.evaluate({ x: ai })
    const fbi = currentFunctionRF.evaluate({ x: bi })

    // Fórmula de Regula Falsi: c = (a*f(b) - b*f(a)) / (f(b) - f(a))
    const ci = (ai * fbi - bi * fai) / (fbi - fai)
    const fci = currentFunctionRF.evaluate({ x: ci })

    iterations.push({
      i: i,
      ai: ai,
      bi: bi,
      ci: ci,
      fci: fci,
    })

    // Verificar si encontramos la raíz o alcanzamos el error aceptable
    if (Math.abs(fci) <= epsilon) {
      return {
        root: ci,
        iterations: iterations,
        converged: true,
      }
    }

    // Actualizar el intervalo según el signo de f(a) * f(c)
    if (fai * fci < 0) {
      // Si f(a) * f(c) < 0, entonces b = c
      bi = ci
    } else {
      // Sino, a = c
      ai = ci
    }
  }

  // Si llegamos aquí, alcanzamos el máximo de iteraciones
  const fai = currentFunctionRF.evaluate({ x: ai })
  const fbi = currentFunctionRF.evaluate({ x: bi })
  const finalC = (ai * fbi - bi * fai) / (fbi - fai)

  return {
    root: finalC,
    iterations: iterations,
    converged: false,
  }
}

function displayResultsRF(result, initialA, initialB) {
  document.getElementById("results-section-rf").style.display = "block"

  const tbody = document.getElementById("iterations-body-rf")
  tbody.innerHTML = ""

  result.iterations.forEach((iter) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${iter.i}</td>
            <td>${iter.ai.toFixed(10)}</td>
            <td>${iter.bi.toFixed(10)}</td>
            <td>${iter.ci.toFixed(10)}</td>
            <td>${iter.fci.toFixed(10)}</td>
        `
    tbody.appendChild(row)
  })

  document.getElementById("final-root-rf").textContent = result.root.toFixed(10)
  document.getElementById("final-iterations-rf").textContent = result.iterations.length
  document.getElementById("final-error-rf").textContent = Math.abs(
    currentFunctionRF.evaluate({ x: result.root }),
  ).toFixed(10)

  plotFunctionWithRootRF(result.root, initialA, initialB)
}
})();