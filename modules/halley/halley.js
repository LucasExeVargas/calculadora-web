// Módulo de Halley - Usa math.js para parsear funciones y Chart.js para graficar
;(() => {
  let currentFunctionHalley = null
  let currentDerivativeHalley = null
  let currentSecondDerivativeHalley = null
  let currentChartHalley = null
  let resultChartHalley = null
  let shouldContinueWithoutFourier = false
  let isDraggingHalley = false
  let lastXHalley = 0
  let lastYHalley = 0
  const math = window.math

  window.initializeHalley = () => {
    console.log("[v0] Inicializando módulo de Halley...")

    const graphBtn = document.getElementById("graph-btn-halley")
    const methodBtn = document.getElementById("method-btn-halley")
    const functionInput = document.getElementById("function-input-halley")
    const resetZoomFunc = document.getElementById("reset-zoom-func-halley")
    const resetZoomResult = document.getElementById("reset-zoom-result-halley")
    const fourierModal = document.getElementById("fourier-modal-halley")
    const fourierContinueBtn = document.getElementById("fourier-continue-btn-halley")
    const fourierCancelBtn = document.getElementById("fourier-cancel-btn-halley")

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

        currentFunctionHalley = math.compile(functionStr)

        // Calcular derivadas simbólicamente
        try {
          const node = math.parse(functionStr)
          const derivativeNode = math.derivative(node, "x")
          const secondDerivativeNode = math.derivative(derivativeNode, "x")

          currentDerivativeHalley = derivativeNode.compile()
          currentSecondDerivativeHalley = secondDerivativeNode.compile()
        } catch (e) {
          alert("Error al calcular la derivada: " + e.message)
          return
        }

        const testValue = currentFunctionHalley.evaluate({ x: 0 })

        document.getElementById("graph-section-halley").style.display = "block"
        document.getElementById("results-section-halley").style.display = "none"

        plotFunctionHalley()
      } catch (error) {
        alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
      }
    })

    // Botón Usar método
    methodBtn.addEventListener("click", () => {
      const x0 = Number.parseFloat(document.getElementById("param-x0-halley").value)
      const error = Number.parseFloat(document.getElementById("param-error-halley").value)
      const maxIter = Number.parseInt(document.getElementById("param-max-iter-halley").value)

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
        const fx0 = currentFunctionHalley.evaluate({ x: x0 })
        const fppx0 = currentSecondDerivativeHalley.evaluate({ x: x0 })

        console.log("[v0] f(x0) =", fx0, "f''(x0) =", fppx0, "Producto =", fx0 * fppx0)

        if (fx0 * fppx0 <= 0) {
          // Mostrar modal de Fourier
          shouldContinueWithoutFourier = false
          fourierModal.classList.add("show")
          return
        }

        // Si se cumple la condición, ejecutar el método
        executeHalleyMethod(x0, error, maxIter)
      } catch (error) {
        alert("Error al ejecutar el método: " + error.message)
      }
    })

    // Manejadores del modal de Fourier
    if (fourierContinueBtn) {
      fourierContinueBtn.addEventListener("click", () => {
        fourierModal.classList.remove("show")
        const x0 = Number.parseFloat(document.getElementById("param-x0-halley").value)
        const error = Number.parseFloat(document.getElementById("param-error-halley").value)
        const maxIter = Number.parseInt(document.getElementById("param-max-iter-halley").value)
        executeHalleyMethod(x0, error, maxIter)
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
        if (currentChartHalley) {
          currentChartHalley.resetZoom()
        }
      })
    }

    if (resetZoomResult) {
      resetZoomResult.addEventListener("click", () => {
        if (resultChartHalley) {
          resultChartHalley.resetZoom()
        }
      })
    }

    // Tres botones Caso de prueba (auto-fill y ejecutar) - Fácil / Medio / Difícil
    const testEasyBtnHalley = document.getElementById("test-easy-halley")
    const testMediumBtnHalley = document.getElementById("test-medium-halley")
    const testHardBtnHalley = document.getElementById("test-hard-halley")

    function setupAndRunHalley(funcStr, x0, errorVal, maxIter = 100) {
      functionInput.value = funcStr
      document.getElementById("param-x0-halley").value = String(x0)
      document.getElementById("param-error-halley").value = String(errorVal)
      document.getElementById("param-max-iter-halley").value = String(maxIter)

      // Graficar
      graphBtn.click()

      // Ejecutar método después de un breve retardo para asegurar compilación
      setTimeout(() => {
        methodBtn.click()
      }, 300)
    }

    if (testEasyBtnHalley) {
      testEasyBtnHalley.addEventListener("click", () => {
        // Caso Fácil: f(x) = x^2 - 4, x0 = 3, eps = 0.001
        setupAndRunHalley("x^2 - 4", 3, 0.001)
      })
    }

    if (testMediumBtnHalley) {
      testMediumBtnHalley.addEventListener("click", () => {
        // Caso Medio: f(x) = x^3 - 2*x - 5, x0 = 2.5, eps = 0.0001
        setupAndRunHalley("x^3 - 2*x - 5", 2.5, 0.0001)
      })
    }

    if (testHardBtnHalley) {
      testHardBtnHalley.addEventListener("click", () => {
        // Caso Difícil: f(x) = e^(-x) - cos(x), x0 = 1.0, eps = 0.00001
        setupAndRunHalley("e^(-x) - cos(x)", 1.0, 0.00001)
      })
    }

    console.log("[v0] Módulo de Halley inicializado correctamente")
  }

  function plotFunctionHalley() {
    const canvas = document.getElementById("function-chart-halley")
    const ctx = canvas.getContext("2d")

    if (currentChartHalley) {
      currentChartHalley.destroy()
    }

    const points = []
    const xMin = -50  // Limitado a 50
    const xMax = 50   // Limitado a 50
    const step = 0.5

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionHalley.evaluate({ x: x })
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

    currentChartHalley = new window.Chart(ctx, {
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
                  resampleChartHalley(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartHalley(chart)
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
          if (canvas && !isDraggingHalley) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    addDragPanFunctionalityHalley(currentChartHalley)
  }

  function addDragPanFunctionalityHalley(chart) {
    const canvas = chart.canvas

    canvas.addEventListener('mousedown', (e) => {
      isDraggingHalley = true
      lastXHalley = e.clientX
      lastYHalley = e.clientY
      canvas.style.cursor = 'grabbing'
    })

    canvas.addEventListener('mousemove', (e) => {
      if (!isDraggingHalley) return

      const deltaX = e.clientX - lastXHalley
      const deltaY = e.clientY - lastYHalley

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
            resampleChartHalley(chart)
          }, 50)
        }
      }

      lastXHalley = e.clientX
      lastYHalley = e.clientY
    })

    canvas.addEventListener('mouseup', () => {
      isDraggingHalley = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('mouseleave', (e) => {
      isDraggingHalley = false
      canvas.style.cursor = 'default'
      
      if (e.relatedTarget) {
        e.relatedTarget.style.cursor = 'default'
      }
    })

    canvas.addEventListener('mouseenter', () => {
      if (!isDraggingHalley) {
        canvas.style.cursor = 'grab'
      }
    })

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDraggingHalley = true
        lastXHalley = e.touches[0].clientX
        lastYHalley = e.touches[0].clientY
        canvas.style.cursor = 'grabbing'
        e.preventDefault()
      }
    })

    canvas.addEventListener('touchmove', (e) => {
      if (!isDraggingHalley || e.touches.length !== 1) return

      const deltaX = e.touches[0].clientX - lastXHalley
      const deltaY = e.touches[0].clientY - lastYHalley

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
            resampleChartHalley(chart)
          }, 50)
        }
      }

      lastXHalley = e.touches[0].clientX
      lastYHalley = e.touches[0].clientY
      e.preventDefault()
    })

    canvas.addEventListener('touchend', () => {
      isDraggingHalley = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('touchcancel', () => {
      isDraggingHalley = false
      canvas.style.cursor = 'default'
    })
  }

  function resampleChartHalley(chart) {
    if (!chart || !currentFunctionHalley) return
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
        const y = currentFunctionHalley.evaluate({ x: x })
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

  function halleyMethod(x0, epsilon, maxIter) {
    const iterations = []
    let xi = x0
    let i = 0

    while (i < maxIter) {
      i++

      const fxi = currentFunctionHalley.evaluate({ x: xi })
      const fpxi = currentDerivativeHalley.evaluate({ x: xi })
      const fppxi = currentSecondDerivativeHalley.evaluate({ x: xi })

      // Comprobar denominador para evitar división por cero
      const denom = 2 * Math.pow(fpxi, 2) - fxi * fppxi
      if (Math.abs(denom) < 1e-14) {
        throw new Error("Denominador muy cercano a cero en la fórmula de Halley")
      }

      // Fórmula de Halley: x_{n+1} = x_n - 2 f f' / (2 (f')^2 - f f'')
      const xi1 = xi - (2 * fxi * fpxi) / denom

      iterations.push({
        i: i,
        xi: xi,
        fxi: fxi,
        fpxi: fpxi,
        fppxi: fppxi,
        xi1: xi1,
      })

      if (Math.abs(xi1 - xi) < epsilon) {
        return {
          root: xi1,
          iterations: iterations,
          converged: true,
        }
      }

      xi = xi1
    }

    return {
      root: xi,
      iterations: iterations,
      converged: false,
    }
  }

  function executeHalleyMethod(x0, epsilon, maxIter) {
    try {
      const result = halleyMethod(x0, epsilon, maxIter)
      displayResultsHalley(result, x0)
    } catch (error) {
      alert("Error al ejecutar el método: " + error.message)
    }
  }

  function displayResultsHalley(result, initialX0) {
    document.getElementById("results-section-halley").style.display = "block"

    const tbody = document.getElementById("iterations-body-halley")
    tbody.innerHTML = ""

    result.iterations.forEach((iter) => {
      const row = document.createElement("tr")
      row.innerHTML = `
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.i}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.xi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.fxi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.fpxi.toFixed(10)}</td>
            <td style="padding: 12px; text-align: center; border: 1px solid #3a3a3a;">${iter.fppxi.toFixed(10)}</td>
        `
      tbody.appendChild(row)
    })

    document.getElementById("final-root-halley").textContent = result.root.toFixed(10)
    document.getElementById("final-iterations-halley").textContent = result.iterations.length
    document.getElementById("final-error-halley").textContent = Math.abs(
      currentFunctionHalley.evaluate({ x: result.root }),
    ).toFixed(10)

    plotFunctionWithRootHalley(result.root, initialX0)
  }

  function plotFunctionWithRootHalley(root, x0) {
    const canvas = document.getElementById("result-chart-halley")
    const ctx = canvas.getContext("2d")

    if (resultChartHalley) {
      resultChartHalley.destroy()
    }

    const points = []
    const xMin = Math.max(Math.min(x0, root) - 2, -50)
    const xMax = Math.min(Math.max(x0, root) + 2, 50)
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionHalley.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    resultChartHalley = new window.Chart(ctx, {
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
            data: [{ x: x0, y: currentFunctionHalley.evaluate({ x: x0 }) }],
            borderColor: "#ff6b6b",
            backgroundColor: "#ff6b6b",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Raíz aproximada",
            data: [{ x: root, y: currentFunctionHalley.evaluate({ x: root }) }],
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
                  resampleChartHalley(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando resultado al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartHalley(chart)
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
          if (canvas && !isDraggingHalley) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    addDragPanFunctionalityHalley(resultChartHalley)
  }

  // Botón Caso de prueba: igual que Newton (e^(-x) - sin(x), x0=0)
  // Rellena, grafica y ejecuta el método automáticamente
  document.addEventListener("click", () => {
    // Ensure DOM loaded handlers exist; we will attach below in initializeHalley when available
  })

  // Add test button handler when DOM content of the module is loaded by the loader
  // We'll attach the listener inside initializeHalley similarly to other modules

  // Attach the test button listener inside initializeHalley to have access to variables
  const originalInit = window.initializeHalley
  // We won't overwrite initializeHalley here — listener is already added in the function body below

})()