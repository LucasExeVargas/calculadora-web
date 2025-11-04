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

    // Tres botones Caso de prueba (auto-fill y ejecutar) - Fácil / Medio / Difícil
    const testEasyBtn = document.getElementById("test-easy-newton")
    const testMediumBtn = document.getElementById("test-medium-newton")
    const testHardBtn = document.getElementById("test-hard-newton")

    function setupAndRunNewton(funcStr, x0, errorVal, maxIter = 100) {
      functionInput.value = funcStr
      document.getElementById("param-x0-newton").value = String(x0)
      document.getElementById("param-error-newton").value = String(errorVal)
      document.getElementById("param-max-iter-newton").value = String(maxIter)

      // Graficar
      graphBtn.click()

      // Ejecutar método después de un pequeño retardo para asegurar que la función esté compilada
      setTimeout(() => {
        methodBtn.click()
      }, 300)
    }

    if (testEasyBtn) {
      testEasyBtn.addEventListener("click", () => {
        // Caso Fácil: f(x) = x^2 - 4, x0 = 3, eps = 0.001
        setupAndRunNewton("x^2 - 4", 3, 0.001)
      })
    }

    if (testMediumBtn) {
      testMediumBtn.addEventListener("click", () => {
        // Caso Medio: f(x) = x^3 - 2*x - 5, x0 = 2.5, eps = 0.0001
        setupAndRunNewton("x^3 - 2*x - 5", 2.5, 0.0001)
      })
    }

    if (testHardBtn) {
      testHardBtn.addEventListener("click", () => {
        // Caso Difícil: f(x) = e^(-x) - cos(x), x0 = 1.0, eps = 0.00001
        setupAndRunNewton("e^(-x) - cos(x)", 1.0, 0.00001)
      })
    }

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
    const xMin = -50
    const xMax = 50
    const step = 0.5

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
                  resampleChartNewton(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartNewton(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando al hacer pan:', e)
                }
              },
            },
            pan: {
              enabled: true,
              mode: "xy",
              modifierKey: null, // Permitir pan sin tecla modificadora
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
        // Habilitar el movimiento con clic y arrastre
                
        onHover: (event, elements) => {
          const canvas = event.native?.target;
          if (canvas && !isDragging) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    // Agregar evento personalizado para arrastre con clic
    addDragPanFunctionalityNewton(currentChartNewton)
  }

  function plotFunctionWithRootNewton(root, x0) {
    const canvas = document.getElementById("result-chart-newton")
    const ctx = canvas.getContext("2d")

    if (resultChartNewton) {
      resultChartNewton.destroy()
    }

    const points = []
    const xMin = Math.max(Math.min(x0, root) - 2)
    const xMax = Math.min(Math.max(x0, root) + 2)
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
                  resampleChartNewton(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando resultado al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartNewton(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando resultado al hacer pan:', e)
                }
              },
            },
            pan: {
              enabled: true,
              mode: "xy",
              modifierKey: null, // Permitir pan sin tecla modificadora
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
        // Habilitar el movimiento con clic y arrastre
        onHover: (event, elements) => {
          const canvas = event.native?.target;
          if (canvas && !isDragging) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    // Agregar evento personalizado para arrastre con clic
    addDragPanFunctionalityNewton(resultChartNewton)
  }

  // Función para agregar funcionalidad de arrastre con clic - CORREGIDA
  // Función para agregar funcionalidad de arrastre con clic - CORREGIDA
  function addDragPanFunctionalityNewton(chart) {
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
        // Calcular el desplazamiento en unidades del gráfico
        const xScale = chart.scales.x
        const yScale = chart.scales.y

        if (xScale && yScale) {
          const pixelRangeX = xScale.max - xScale.min
          const pixelRangeY = yScale.max - yScale.min
          
          const canvasWidth = chart.width
          const canvasHeight = chart.height

          // CORREGIDO: Invertir el signo para movimiento natural
          const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
          const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * 1  // Cambiado a -1

          // Actualizar los límites de los ejes
          chart.options.scales.x.min += deltaUnitsX
          chart.options.scales.x.max += deltaUnitsX
          chart.options.scales.y.min += deltaUnitsY  // Cambiado a +
          chart.options.scales.y.max += deltaUnitsY  // Cambiado a +

          chart.update()

          // Remuestrear después de mover
          setTimeout(() => {
            resampleChartNewton(chart)
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
      // CORREGIDO: Restaurar cursor por defecto cuando el mouse sale del canvas
      canvas.style.cursor = 'default'
      
      // También restaurar el cursor en el evento relatedTarget si está disponible
      if (e.relatedTarget) {
        e.relatedTarget.style.cursor = 'default'
      }
    })

    canvas.addEventListener('mouseenter', () => {
      // CORREGIDO: Solo cambiar a 'grab' cuando el mouse entra y no está arrastrando
      if (!isDragging) {
        canvas.style.cursor = 'grab'
      }
    })

    // Soporte para touch devices - CORREGIDO
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

          // CORREGIDO: Invertir el signo para movimiento natural
          const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
          const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * -1  // Cambiado a -1

          chart.options.scales.x.min += deltaUnitsX
          chart.options.scales.x.max += deltaUnitsX
          chart.options.scales.y.min += deltaUnitsY  // Cambiado a +
          chart.options.scales.y.max += deltaUnitsY  // Cambiado a +

          chart.update()

          setTimeout(() => {
            resampleChartNewton(chart)
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

    // CORREGIDO: Agregar event listener para cuando el touch sale del canvas
    canvas.addEventListener('touchcancel', () => {
      isDragging = false
      canvas.style.cursor = 'default'
    })
  }

  // Re-muestrea el dataset principal del gráfico usando los límites actuales de la escala X
  function resampleChartNewton(chart) {
    if (!chart || !currentFunctionNewton) return
    const xScale = chart.scales && chart.scales.x
    if (!xScale) return
    let xMin = typeof xScale.min === 'number' ? xScale.min : -50
    let xMax = typeof xScale.max === 'number' ? xScale.max : 50

    // Evitar rangos inválidos
    if (!isFinite(xMin) || !isFinite(xMax) || xMin === xMax) {
      return
    }

    // Elegir número de muestras razonable según el ancho
    const samples = 500
    const step = (xMax - xMin) / samples
    const points = []
    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionNewton.evaluate({ x: x })
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
})()