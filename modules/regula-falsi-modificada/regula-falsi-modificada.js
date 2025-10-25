// Módulo de Regula Falsi - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html

let currentFunctionRFM = null
let currentChartRFM = null
let resultChartRFM = null



window.initializeRegulaFalsiModificada = () => {
  console.log("[v0] Inicializando módulo de Regula Falsi...")

  const graphBtn = document.getElementById("graph-btn-rfm")
  const methodBtn = document.getElementById("method-btn-rfm")
  const functionInput = document.getElementById("function-input-rfm")
  const resetZoomFunc = document.getElementById("reset-zoom-func-rfm")
  const resetZoomResult = document.getElementById("reset-zoom-result-rfm")

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

      currentFunctionRFM = math.compile(functionStr)
      const testValue = currentFunctionRFM.evaluate({ x: 0 })

      document.getElementById("graph-section-rfm").style.display = "block"
      document.getElementById("results-section-rfm").style.display = "none"

      plotFunctionRFM()
    } catch (error) {
      alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
    }
  })

  // Botón Usar método
  methodBtn.addEventListener("click", () => {
    const a = Number.parseFloat(document.getElementById("param-a-rfm").value)
    const b = Number.parseFloat(document.getElementById("param-b-rfm").value)
    const error = Number.parseFloat(document.getElementById("param-error-rfm").value)
    const maxIter = Number.parseInt(document.getElementById("param-max-iter-rfm").value)

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
      const fa = currentFunctionRFM.evaluate({ x: a })
      const fb = currentFunctionRFM.evaluate({ x: b })

      if (fa * fb > 0) {
        alert(
          "Error: f(a) · f(b) > 0\n\nNo existe una raíz en el intervalo [a, b] según el método de Regula Falsi.\nPor favor, elige otro intervalo.",
        )
        return
      }

      const result = regulaFalsiModificadaMethod(a, b, error, maxIter)
      displayResultsRFM(result, a, b)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  })

  // Botones de reset zoom
  if (resetZoomFunc) {
    resetZoomFunc.addEventListener("click", () => {
      if (currentChartRFM) {
        currentChartRFM.resetZoom()
      }
    })
  }

  if (resetZoomResult) {
    resetZoomResult.addEventListener("click", () => {
      if (resultChartRFM) {
        resultChartRFM.resetZoom()
      }
    })
  }

  console.log("[v0] Módulo de Regula Falsi inicializado correctamente")
}

function plotFunctionRFM() {
  const canvas = document.getElementById("function-chart-rfm")
  const ctx = canvas.getContext("2d")

  if (currentChartRFM) {
    currentChartRFM.destroy()
  }

  const points = []
  const xMin = -10
  const xMax = 10
  const step = 0.1

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRFM.evaluate({ x: x })
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

  currentChartRFM = new Chart(ctx, {
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
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
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
    },
  })
}

function plotFunctionRFM() {
  console.log("[v0] Graficando función...")
  const canvas = document.getElementById("function-chart-rfm")

  if (!canvas) {
    console.error("[v0] Canvas no encontrado")
    return
  }

  const ctx = canvas.getContext("2d")

  if (currentChartRFM) {
    currentChartRFM.destroy()
  }

  const points = []
  const xMin = -10
  const xMax = 10
  const step = 0.1

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRFM.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  console.log("[v0] Puntos generados:", points.length)

  if (typeof Chart === "undefined") {
    alert("Error: La librería Chart.js no está cargada")
    return
  }

  currentChartRFM = new Chart(ctx, {
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
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
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
    },
  })

  console.log("[v0] Gráfico creado correctamente")
}

function regulaFalsiModificadaMethod(a, b, epsilon, maxIter) {
  console.log("[v0] Iniciando método de Regula Falsi Modificada")
  const iterations = []
  let ai = a
  let bi = b
  let i = 0

  let F = currentFunctionRFM.evaluate({ x: ai })
  let G = currentFunctionRFM.evaluate({ x: bi })
  let w = F

  while (i < maxIter) {
    i++

    const ci = (ai * G - bi * F) / (G - F)
    const fci = currentFunctionRFM.evaluate({ x: ci })

    iterations.push({
      i: i,
      ai: ai,
      bi: bi,
      ci: ci,
      fci: fci,
      F: F,
      G: G,
    })

    // Verificar si encontramos la raíz o alcanzamos el error aceptable
    if (Math.abs(fci) <= epsilon) {
      console.log("[v0] Convergencia alcanzada en iteración", i)
      return {
        root: ci,
        iterations: iterations,
        converged: true,
      }
    }

    const fai = currentFunctionRFM.evaluate({ x: ai })

    if (fai * fci < 0) {
      // Si f(a) * f(c) < 0, entonces b = c
      bi = ci
      G = fci
      // Si w · G > 0 entonces F = F / 2
      if (w * G > 0) {
        F = F / 2
      }
    } else {
      // Sino, a = c
      ai = ci
      F = fci
      // Si w · F > 0 entonces G = G / 2
      if (w * F > 0) {
        G = G / 2
      }
    }

    // Actualizar w = f(c)
    w = fci
  }

  // Si llegamos aquí, alcanzamos el máximo de iteraciones
  console.log("[v0] Máximo de iteraciones alcanzado")
  const finalC = (ai * G - bi * F) / (G - F)

  return {
    root: finalC,
    iterations: iterations,
    converged: false,
  }
}

function displayResultsRFM(result, initialA, initialB) {
  document.getElementById("results-section-rfm").style.display = "block"

  const tbody = document.getElementById("iterations-body-rfm")
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

  document.getElementById("final-root-rfm").textContent = result.root.toFixed(10)
  document.getElementById("final-iterations-rfm").textContent = result.iterations.length
  document.getElementById("final-error-rfm").textContent = Math.abs(
    currentFunctionRFM.evaluate({ x: result.root }),
  ).toFixed(10)

  plotFunctionWithRootRFM(result.root, initialA, initialB)
}

function plotFunctionWithRootRFM(root, a, b) {
  const canvas = document.getElementById("result-chart-rfm")
  const ctx = canvas.getContext("2d")

  if (resultChartRFM) {
    resultChartRFM.destroy()
  }

  const points = []
  const xMin = Math.min(a, b) - 2
  const xMax = Math.max(a, b) + 2
  const step = (xMax - xMin) / 200

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = currentFunctionRFM.evaluate({ x: x })
      if (isFinite(y)) {
        points.push({ x: x, y: y })
      }
    } catch (e) {
      // Ignorar puntos donde la función no está definida
    }
  }

  resultChartRFM = new Chart(ctx, {
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
          data: [{ x: a, y: currentFunctionRFM.evaluate({ x: a }) }],
          borderColor: "#ff6b6b",
          backgroundColor: "#ff6b6b",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Punto b",
          data: [{ x: b, y: currentFunctionRFM.evaluate({ x: b }) }],
          borderColor: "#ffd93d",
          backgroundColor: "#ffd93d",
          pointRadius: 8,
          pointStyle: "circle",
          showLine: false,
        },
        {
          label: "Raíz aproximada",
          data: [{ x: root, y: currentFunctionRFM.evaluate({ x: root }) }],
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
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "xy",
          },
          pan: {
            enabled: true,
            mode: "xy",
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
    },
  })
}
