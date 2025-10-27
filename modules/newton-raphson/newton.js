// Módulo de Newton-Raphson - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html
;(() => {
  let currentFunctionNewton = null
  let currentDerivativeNewton = null
  let currentSecondDerivativeNewton = null
  let currentChartNewton = null
  let resultChartNewton = null
  let shouldContinueWithoutFourier = false
  const math = window.math

  window.initializeNewton = () => {
    console.log("[v0] Inicializando módulo de Newton...")

    const graphBtn = document.getElementById("graph-btn-newton")
    const methodBtn = document.getElementById("method-btn-newton")
    const functionInput = document.getElementById("function-input-newton")
    const resetZoomFunc = document.getElementById("reset-zoom-func-newton")
    const resetZoomResult = document.getElementById("reset-zoom-result-newton")
    const fourierModal = document.getElementById("fourier-modal")
    const fourierContinueBtn = document.getElementById("fourier-continue-btn")
    const fourierCancelBtn = document.getElementById("fourier-cancel-btn")

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

        currentFunctionNewton = math.compile(functionStr)

        // Calcular derivada simbólicamente
        try {
          const node = math.parse(functionStr)
          const derivativeNode = math.derivative(node, "x")
          const secondDerivativeNode = math.derivative(derivativeNode, "x")

          currentDerivativeNewton = derivativeNode.compile()
          currentSecondDerivativeNewton = secondDerivativeNode.compile()
        } catch (e) {
          alert("Error al calcular la derivada: " + e.message)
          return
        }

        const testValue = currentFunctionNewton.evaluate({ x: 0 })

        document.getElementById("graph-section-newton").style.display = "block"
        document.getElementById("results-section-newton").style.display = "none"

        plotFunctionNewton()
      } catch (error) {
        alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
      }
    })

    // Botón Usar método
    methodBtn.addEventListener("click", () => {
      const x0 = Number.parseFloat(document.getElementById("param-x0-newton").value)
      const error = Number.parseFloat(document.getElementById("param-error-newton").value)
      const maxIter = Number.parseInt(document.getElementById("param-max-iter-newton").value)

      if (isNaN(x0)) {
        alert("Por favor, introduce un valor válido para X₀")
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
        // Verificar condición de Fourier: f(x0) * f''(x0) > 0
        const fx0 = currentFunctionNewton.evaluate({ x: x0 })
        const fppx0 = currentSecondDerivativeNewton.evaluate({ x: x0 })

        console.log("[v0] f(x0) =", fx0, "f''(x0) =", fppx0, "Producto =", fx0 * fppx0)

        if (fx0 * fppx0 <= 0) {
          // Mostrar modal de Fourier
          shouldContinueWithoutFourier = false
          fourierModal.classList.add("show")
          return
        }

        // Si se cumple la condición, ejecutar el método
        executeNewtonMethod(x0, error, maxIter)
      } catch (error) {
        alert("Error al ejecutar el método: " + error.message)
      }
    })

    // Manejadores del modal de Fourier
    if (fourierContinueBtn) {
      fourierContinueBtn.addEventListener("click", () => {
        fourierModal.classList.remove("show")
        const x0 = Number.parseFloat(document.getElementById("param-x0-newton").value)
        const error = Number.parseFloat(document.getElementById("param-error-newton").value)
        const maxIter = Number.parseInt(document.getElementById("param-max-iter-newton").value)
        executeNewtonMethod(x0, error, maxIter)
      })
    }

    if (fourierCancelBtn) {
      fourierCancelBtn.addEventListener("click", () => {
        fourierModal.classList.remove("show")
      })
    }

    // Botones de reset zoom
    if (resetZoomFunc) {
      resetZoomFunc.addEventListener("click", () => {
        if (currentChartNewton) {
          currentChartNewton.resetZoom()
        }
      })
    }

    if (resetZoomResult) {
      resetZoomResult.addEventListener("click", () => {
        if (resultChartNewton) {
          resultChartNewton.resetZoom()
        }
      })
    }

    console.log("[v0] Módulo de Newton inicializado correctamente")
  }

  function plotFunctionNewton() {
    const canvas = document.getElementById("function-chart-newton")
    const ctx = canvas.getContext("2d")

    if (currentChartNewton) {
      currentChartNewton.destroy()
    }

    const points = []
    const xMin = -10
    const xMax = 10
    const step = 0.1

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionNewton.evaluate({ x: x })
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

    currentChartNewton = new window.Chart(ctx, {
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

  function executeNewtonMethod(x0, epsilon, maxIter) {
    try {
      const result = newtonMethod(x0, epsilon, maxIter)
      displayResultsNewton(result, x0)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  }

  function newtonMethod(x0, epsilon, maxIter) {
    const iterations = []
    let xi = x0
    let i = 0

    while (i < maxIter) {
      i++

      // Calcular f(xi) y f'(xi)
      const fxi = currentFunctionNewton.evaluate({ x: xi })
      const fpxi = currentDerivativeNewton.evaluate({ x: xi })

      // Verificar que la derivada no sea cero
      if (Math.abs(fpxi) < 1e-10) {
        throw new Error("La derivada es muy cercana a cero. No se puede continuar.")
      }

      // Fórmula de Newton: x_{i+1} = x_i - f(x_i) / f'(x_i)
      const xi1 = xi - fxi / fpxi

      iterations.push({
        i: i,
        xi: xi,
        fxi: fxi,
        fpxi: fpxi,
        xi1: xi1,
      })

      // Verificar si encontramos la raíz o alcanzamos el error aceptable
      if (Math.abs(xi1 - xi) < epsilon) {
        return {
          root: xi1,
          iterations: iterations,
          converged: true,
        }
      }

      xi = xi1
    }

    // Si llegamos aquí, alcanzamos el máximo de iteraciones
    return {
      root: xi,
      iterations: iterations,
      converged: false,
    }
  }

  function displayResultsNewton(result, initialX0) {
    document.getElementById("results-section-newton").style.display = "block"

    const tbody = document.getElementById("iterations-body-newton")
    tbody.innerHTML = ""

    result.iterations.forEach((iter) => {
      const row = document.createElement("tr")
      row.innerHTML = `
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.i}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.fxi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.fpxi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xi1.toFixed(10)}</td>
        `
      tbody.appendChild(row)
    })

    document.getElementById("final-root-newton").textContent = result.root.toFixed(10)
    document.getElementById("final-iterations-newton").textContent = result.iterations.length
    document.getElementById("final-error-newton").textContent = Math.abs(
      currentFunctionNewton.evaluate({ x: result.root }),
    ).toFixed(10)

    plotFunctionWithRootNewton(result.root, initialX0)
  }

  function plotFunctionWithRootNewton(root, x0) {
    const canvas = document.getElementById("result-chart-newton")
    const ctx = canvas.getContext("2d")

    if (resultChartNewton) {
      resultChartNewton.destroy()
    }

    const points = []
    const xMin = Math.min(x0, root) - 2
    const xMax = Math.max(x0, root) + 2
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionNewton.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    resultChartNewton = new window.Chart(ctx, {
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
            data: [{ x: x0, y: currentFunctionNewton.evaluate({ x: x0 }) }],
            borderColor: "#ff6b6b",
            backgroundColor: "#ff6b6b",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Raíz aproximada",
            data: [{ x: root, y: currentFunctionNewton.evaluate({ x: root }) }],
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
