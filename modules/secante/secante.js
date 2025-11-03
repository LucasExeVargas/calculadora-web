// Módulo de Secante - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html
;(() => {
  let currentFunctionSecante = null
  let currentChartSecante = null
  let resultChartSecante = null
  const math = window.math

  window.initializeSecante = () => {
    console.log("[v0] Inicializando módulo de Secante...")

    const graphBtn = document.getElementById("graph-btn-secante")
    const methodBtn = document.getElementById("method-btn-secante")
    const functionInput = document.getElementById("function-input-secante")
    const resetZoomFunc = document.getElementById("reset-zoom-func-secante")
    const resetZoomResult = document.getElementById("reset-zoom-result-secante")

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

        currentFunctionSecante = math.compile(functionStr)

        const testValue = currentFunctionSecante.evaluate({ x: 0 })

        document.getElementById("graph-section-secante").style.display = "block"
        document.getElementById("results-section-secante").style.display = "none"

        plotFunctionSecante()
      } catch (error) {
        alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
      }
    })

    // Botón Caso de prueba (auto-fill y ejecutar)
    const testBtn = document.getElementById("test-btn-secante")
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        const funcStr = "e^(-x) - sin(x)"
        functionInput.value = funcStr
        document.getElementById("param-x0-secante").value = "0"
        document.getElementById("param-x1-secante").value = "1"
        document.getElementById("param-error-secante").value = "0.001"

        // Graficar
        graphBtn.click()

        // Ejecutar método después de un breve retardo
        setTimeout(() => {
          methodBtn.click()
        }, 300)
      })
    }

    // Botón Usar método
    methodBtn.addEventListener("click", () => {
      const x0 = Number.parseFloat(document.getElementById("param-x0-secante").value)
      const x1 = Number.parseFloat(document.getElementById("param-x1-secante").value)
      const error = Number.parseFloat(document.getElementById("param-error-secante").value)
      const maxIter = Number.parseInt(document.getElementById("param-max-iter-secante").value)

      if (isNaN(x0)) {
        alert("Por favor, introduce un valor válido para X₀")
        return
      }

      if (isNaN(x1)) {
        alert("Por favor, introduce un valor válido para X₁")
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
        executeSecanteMethod(x0, x1, error, maxIter)
      } catch (error) {
        alert("Error al ejecutar el método: " + error.message)
      }
    })

    // Botones de reset zoom
    if (resetZoomFunc) {
      resetZoomFunc.addEventListener("click", () => {
        if (currentChartSecante) {
          currentChartSecante.resetZoom()
        }
      })
    }

    if (resetZoomResult) {
      resetZoomResult.addEventListener("click", () => {
        if (resultChartSecante) {
          resultChartSecante.resetZoom()
        }
      })
    }

    console.log("[v0] Módulo de Secante inicializado correctamente")
  }

  function plotFunctionSecante() {
    const canvas = document.getElementById("function-chart-secante")
    const ctx = canvas.getContext("2d")

    if (currentChartSecante) {
      currentChartSecante.destroy()
    }

    const points = []
    const xMin = -10
    const xMax = 10
    const step = 0.1

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionSecante.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    if (typeof window.Chart === "undefined") {
      alert("Error: La librería Chart.js no está cargada")
      return
    }

    currentChartSecante = new window.Chart(ctx, {
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

  function executeSecanteMethod(x0, x1, epsilon, maxIter) {
    try {
      const result = secanteMethod(x0, x1, epsilon, maxIter)
      displayResultsSecante(result, x0, x1)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  }

  function secanteMethod(x0, x1, epsilon, maxIter) {
    const iterations = []
    let xn_1 = x0 // x_{i-1}
    let xn = x1 // x_i
    let i = 0

    while (i < maxIter) {
      i++

      // Calcular f(x_{i-1}) y f(x_i)
      const fxn_1 = currentFunctionSecante.evaluate({ x: xn_1 })
      const fxn = currentFunctionSecante.evaluate({ x: xn })

      // Verificar que el denominador no sea cero
      if (Math.abs(fxn - fxn_1) < 1e-10) {
        throw new Error("El denominador f(x_i) - f(x_{i-1}) es muy cercano a cero. No se puede continuar.")
      }

      // Fórmula de la Secante: x_{i+1} = (x_{i-1} * f(x_i) - x_i * f(x_{i-1})) / (f(x_i) - f(x_{i-1}))
      const xn1 = (xn_1 * fxn - xn * fxn_1) / (fxn - fxn_1)
      const fxn1= currentFunctionSecante.evaluate({ x: xn1 })
      const error = Math.abs(xn1 - xn)

      iterations.push({
        i: i,
        xn_1: xn_1,
        xn: xn,
        xn1: xn1,
        fxn1: fxn1,
        error: error,
      })

      // Verificar si encontramos la raíz o alcanzamos el error aceptable
      if (error < epsilon) {
        return {
          root: xn1,
          iterations: iterations,
          converged: true,
        }
      }

      // Actualizar valores para la siguiente iteración
      xn_1 = xn
      xn = xn1
    }

    // Si llegamos aquí, alcanzamos el máximo de iteraciones
    return {
      root: xn,
      iterations: iterations,
      converged: false,
    }
  }

  function displayResultsSecante(result, initialX0, initialX1) {
    document.getElementById("results-section-secante").style.display = "block"

    const tbody = document.getElementById("iterations-body-secante")
    tbody.innerHTML = ""

    result.iterations.forEach((iter) => {
      const row = document.createElement("tr")
      row.innerHTML = `
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.i}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xn_1.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xn.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xn1.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${Math.abs(iter.fxn1).toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.error.toFixed(10)}</td>
        `
      tbody.appendChild(row)
    })

    document.getElementById("final-root-secante").textContent = result.root.toFixed(10)
    document.getElementById("final-iterations-secante").textContent = result.iterations.length
    document.getElementById("final-error-secante").textContent = Math.abs(
      currentFunctionSecante.evaluate({ x: result.root }),
    ).toFixed(10)

    plotFunctionWithRootSecante(result.root, initialX0, initialX1)
  }

  function plotFunctionWithRootSecante(root, x0, x1) {
    const canvas = document.getElementById("result-chart-secante")
    const ctx = canvas.getContext("2d")

    if (resultChartSecante) {
      resultChartSecante.destroy()
    }

    const points = []
    const xMin = Math.min(x0, x1, root) - 2
    const xMax = Math.max(x0, x1, root) + 2
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionSecante.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    resultChartSecante = new window.Chart(ctx, {
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
            label: "Punto inicial X₀",
            data: [{ x: x0, y: currentFunctionSecante.evaluate({ x: x0 }) }],
            borderColor: "#ff6b6b",
            backgroundColor: "#ff6b6b",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Punto inicial X₁",
            data: [{ x: x1, y: currentFunctionSecante.evaluate({ x: x1 }) }],
            borderColor: "#ffa94d",
            backgroundColor: "#ffa94d",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Raíz aproximada",
            data: [{ x: root, y: currentFunctionSecante.evaluate({ x: root }) }],
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
})()
