// Módulo de Punto Fijo - Usa math.js para parsear funciones y Chart.js para graficar
;(() => {
  let currentFunctionPuntoFijo = null
  let currentGFunctionPuntoFijo = null
  let currentChartPuntoFijo = null
  let resultChartPuntoFijo = null
  const math = window.math

  window.initializePuntoFijo = () => {
    console.log("[v0] Inicializando módulo de Punto Fijo...")

    const graphBtn = document.getElementById("graph-btn-punto-fijo")
    const methodBtn = document.getElementById("method-btn-punto-fijo")
    const functionInput = document.getElementById("function-input-punto-fijo")
    const resetZoomFunc = document.getElementById("reset-zoom-func-punto-fijo")
    const resetZoomResult = document.getElementById("reset-zoom-result-punto-fijo")

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

        currentFunctionPuntoFijo = math.compile(functionStr)
        const testValue = currentFunctionPuntoFijo.evaluate({ x: 0 })

        document.getElementById("graph-section-punto-fijo").style.display = "block"
        document.getElementById("results-section-punto-fijo").style.display = "none"

        plotFunctionPuntoFijo()
      } catch (error) {
        alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
      }
    })

    // Botón Caso de prueba (auto-fill y ejecutar)
    const testBtn = document.getElementById("test-btn-punto-fijo")
    if (testBtn) {
      testBtn.addEventListener("click", () => {
        // Funciones y parámetros solicitados
        const fStr = "x^4 - 3*x^2 - 3"
        const gStr = "(3*x^2 + 3)^(1/4)"

        functionInput.value = fStr
        document.getElementById("g-function-input-punto-fijo").value = gStr
        document.getElementById("param-a-punto-fijo").value = "1"
        document.getElementById("param-b-punto-fijo").value = "2"
        document.getElementById("param-x0-punto-fijo").value = "2"
        document.getElementById("param-error-punto-fijo").value = "0.001"

        // Graficar la función F
        graphBtn.click()

        // Ejecutar método después de un breve retardo
        setTimeout(() => {
          // Antes de ejecutar, añadimos un listener temporal para aceptar automáticamente
          // el modal de convergencia si aparece (continuar)
          const continueBtn = document.getElementById("continue-btn-punto-fijo")
          if (continueBtn) {
            const autoContinue = () => {
              continueBtn.click()
              // Remover el listener después de un click
              continueBtn.removeEventListener("click", autoContinue)
            }
            continueBtn.addEventListener("click", autoContinue)
            // También intentar cerrar el modal programáticamente si ya está visible
            const modal = document.getElementById("convergence-modal-punto-fijo")
            if (modal && modal.style.display === "flex") {
              // Forzar continuar
              continueBtn.click()
            }
          }

          // Ejecutar método
          methodBtn.click()
        }, 400)
      })
    }

    // Botón Usar método
    methodBtn.addEventListener("click", () => {
      const gFunctionStr = document.getElementById("g-function-input-punto-fijo").value.trim()
      const a = Number.parseFloat(document.getElementById("param-a-punto-fijo").value)
      const b = Number.parseFloat(document.getElementById("param-b-punto-fijo").value)
      const x0 = Number.parseFloat(document.getElementById("param-x0-punto-fijo").value)
      const error = Number.parseFloat(document.getElementById("param-error-punto-fijo").value)
      const maxIter = Number.parseInt(document.getElementById("param-max-iter-punto-fijo").value)

      if (!gFunctionStr) {
        alert("Por favor, introduce la función G(x)")
        return
      }

      if (isNaN(a) || isNaN(b)) {
        alert("Por favor, introduce valores válidos para el intervalo [a, b]")
        return
      }

      if (a >= b) {
        alert("El valor de 'a' debe ser menor que 'b'")
        return
      }

      if (isNaN(x0)) {
        alert("Por favor, introduce un valor válido para X₀")
        return
      }

      if (x0 < a || x0 > b) {
        alert("El valor de X₀ debe estar dentro del intervalo [a, b]")
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
        currentGFunctionPuntoFijo = math.compile(gFunctionStr)
        const testValue = currentGFunctionPuntoFijo.evaluate({ x: x0 })

        // Verificar convergencia de G(x)
        checkConvergence(a, b, x0, error, maxIter)
      } catch (error) {
        alert("Error en la función G(x): " + error.message)
      }
    })

    // Botones de reset zoom
    if (resetZoomFunc) {
      resetZoomFunc.addEventListener("click", () => {
        if (currentChartPuntoFijo) {
          currentChartPuntoFijo.resetZoom()
        }
      })
    }

    if (resetZoomResult) {
      resetZoomResult.addEventListener("click", () => {
        if (resultChartPuntoFijo) {
          resultChartPuntoFijo.resetZoom()
        }
      })
    }

    console.log("[v0] Módulo de Punto Fijo inicializado correctamente")
  }

  function plotFunctionPuntoFijo() {
    const canvas = document.getElementById("function-chart-punto-fijo")
    const ctx = canvas.getContext("2d")

    if (currentChartPuntoFijo) {
      currentChartPuntoFijo.destroy()
    }

    const points = []
    const xMin = -10
    const xMax = 10
    const step = 0.1

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionPuntoFijo.evaluate({ x: x })
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

    currentChartPuntoFijo = new window.Chart(ctx, {
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

  function checkConvergence(a, b, x0, epsilon, maxIter) {
    // Calcular la derivada numérica de G(x) en varios puntos del intervalo
    const numPoints = 20
    const step = (b - a) / numPoints
    let hasIssue = false

    for (let i = 0; i <= numPoints; i++) {
      const x = a + i * step
      const h = 0.0001

      try {
        const gx = currentGFunctionPuntoFijo.evaluate({ x: x })
        const gxh = currentGFunctionPuntoFijo.evaluate({ x: x + h })
        const derivative = (gxh - gx) / h

        if (Math.abs(derivative) > 1) {
          hasIssue = true
          break
        }
      } catch (e) {
        // Si hay error evaluando, continuar
      }
    }

    if (hasIssue) {
      showConvergenceModal(x0, epsilon, maxIter)
    } else {
      executePuntoFijoMethod(x0, epsilon, maxIter)
    }
  }

  function showConvergenceModal(x0, epsilon, maxIter) {
    const modal = document.getElementById("convergence-modal-punto-fijo")
    const cancelBtn = document.getElementById("cancel-btn-punto-fijo")
    const continueBtn = document.getElementById("continue-btn-punto-fijo")

    modal.style.display = "flex"

    const handleCancel = () => {
      modal.style.display = "none"
      cancelBtn.removeEventListener("click", handleCancel)
      continueBtn.removeEventListener("click", handleContinue)
    }

    const handleContinue = () => {
      modal.style.display = "none"
      executePuntoFijoMethod(x0, epsilon, maxIter)
      cancelBtn.removeEventListener("click", handleCancel)
      continueBtn.removeEventListener("click", handleContinue)
    }

    cancelBtn.addEventListener("click", handleCancel)
    continueBtn.addEventListener("click", handleContinue)
  }

  function executePuntoFijoMethod(x0, epsilon, maxIter) {
    try {
      const result = puntoFijoMethod(x0, epsilon, maxIter)
      displayResultsPuntoFijo(result, x0)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  }

  function puntoFijoMethod(x0, epsilon, maxIter) {
    const iterations = []
    let xi = x0
    let i = 0

    iterations.push({
      i: 0,
      xi: x0,
      fxi: currentFunctionPuntoFijo.evaluate({ x: x0 }),
      error: null, // No error for first iteration
    })

    while (i < maxIter) {
      i++

      // Calcular x_{i} = G(x_{i-1})
      const xi_new = currentGFunctionPuntoFijo.evaluate({ x: xi })

      // Calcular f(x_{i})
      const fxi = currentFunctionPuntoFijo.evaluate({ x: xi_new })

      // Calcular error |x_i - x_{i-1}|
      const error = Math.abs(xi_new - xi)

      iterations.push({
        i: i,
        xi: xi_new,
        fxi: fxi,
        error: error,
      })

      // Verificar convergencia
      if (error < epsilon) {
        return {
          root: xi_new,
          iterations: iterations,
          converged: true,
        }
      }

      // Actualizar para la siguiente iteración
      xi = xi_new
    }

    // Si llegamos aquí, alcanzamos el máximo de iteraciones
    return {
      root: xi,
      iterations: iterations,
      converged: false,
    }
  }

  function displayResultsPuntoFijo(result, initialX0) {
    document.getElementById("results-section-punto-fijo").style.display = "block"

    const tbody = document.getElementById("iterations-body-punto-fijo")
    tbody.innerHTML = ""

    result.iterations.forEach((iter) => {
      const row = document.createElement("tr")

      // For first row (i=0), show dash for error
      const errorDisplay = iter.error === null ? "—" : iter.error.toFixed(10)

      row.innerHTML = `
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.i}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${Math.abs(iter.fxi).toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${errorDisplay}</td>
        `
      tbody.appendChild(row)
    })

    const lastIter = result.iterations[result.iterations.length - 1]
    document.getElementById("final-root-punto-fijo").textContent = lastIter.xi.toFixed(10)
    document.getElementById("final-iterations-punto-fijo").textContent = result.iterations.length - 1 // Subtract 1 to not count initial value
    document.getElementById("final-error-punto-fijo").textContent = Math.abs(lastIter.fxi).toFixed(10)

    plotFunctionWithRootPuntoFijo(lastIter.xi, initialX0)
  }

  function plotFunctionWithRootPuntoFijo(root, x0) {
    const canvas = document.getElementById("result-chart-punto-fijo")
    const ctx = canvas.getContext("2d")

    if (resultChartPuntoFijo) {
      resultChartPuntoFijo.destroy()
    }

    const points = []
    const xMin = Math.min(x0, root) - 2
    const xMax = Math.max(x0, root) + 2
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionPuntoFijo.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    resultChartPuntoFijo = new window.Chart(ctx, {
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
            data: [{ x: x0, y: currentFunctionPuntoFijo.evaluate({ x: x0 }) }],
            borderColor: "#ff6b6b",
            backgroundColor: "#ff6b6b",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Raíz aproximada",
            data: [{ x: root, y: currentFunctionPuntoFijo.evaluate({ x: root }) }],
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
