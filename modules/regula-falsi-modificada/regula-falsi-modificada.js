// Módulo de Regula Falsi Modificada - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html
;(() => {
  let currentFunctionRFM = null
  let currentChartRFM = null
  let resultChartRFM = null

  // Importación de math.js y Chart.js
  window.initializeRegulaFalsiModificada = () => {
    console.log("[v0] Inicializando módulo de Regula Falsi Modificada...")

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
        const math = window.math // Declare the math variable here
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

    // Botones Caso de prueba (auto-fill y ejecutar): fácil/medio/difícil
    const testEasyBtn = document.getElementById("test-easy-rfm")
    const testMediumBtn = document.getElementById("test-medium-rfm")
    const testHardBtn = document.getElementById("test-hard-rfm")

    function setupAndRunRFM(funcStr, a, b, errorVal, maxIter = 100) {
      functionInput.value = funcStr
      document.getElementById("param-a-rfm").value = String(a)
      document.getElementById("param-b-rfm").value = String(b)
      document.getElementById("param-error-rfm").value = String(errorVal)
      document.getElementById("param-max-iter-rfm").value = String(maxIter)

      // Graficar
      graphBtn.click()

      // Ejecutar método después de un breve retardo
      setTimeout(() => {
        methodBtn.click()
      }, 300)
    }

    if (testEasyBtn) {
      // Caso de Prueba 1 (Fácil)
      testEasyBtn.addEventListener("click", () => {
        setupAndRunRFM("x - 2", 1, 3, 0.001)
      })
    }

    if (testMediumBtn) {
      // Caso de Prueba 2 (Medio)
      testMediumBtn.addEventListener("click", () => {
        setupAndRunRFM("(x+1)^3", -2, -0.5, 0.0001)
      })
    }

    if (testHardBtn) {
      // Caso de Prueba 3 (Difícil)
      testHardBtn.addEventListener("click", () => {
        setupAndRunRFM("x^5 - 3*x^3 - 2*x + 1", 1, 2, 0.00001)
      })
    }

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
            "Error: f(a) · f(b) > 0\n\nNo existe una raíz en el intervalo [a, b] según el método de Regula Falsi Modificada.\nPor favor, elige otro intervalo.",
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

    console.log("[v0] Módulo de Regula Falsi Modificada inicializado correctamente")
  }

  function plotFunctionRFM() {
    const canvas = document.getElementById("function-chart-rfm")
    const ctx = canvas.getContext("2d")

    if (currentChartRFM) {
      currentChartRFM.destroy()
    }

    const points = []
    const xMin = -50  // Limitado a 50
    const xMax = 50   // Limitado a 50
    const step = 0.5

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
                  resampleChartRFM(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartRFM(chart)
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
          if (canvas && !isDraggingRFM) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    addDragPanFunctionalityRFM(currentChartRFM)
  }

  let isDraggingRFM = false
  let lastXRFM = 0
  let lastYRFM = 0

  function addDragPanFunctionalityRFM(chart) {
    const canvas = chart.canvas

    canvas.addEventListener('mousedown', (e) => {
      isDraggingRFM = true
      lastXRFM = e.clientX
      lastYRFM = e.clientY
      canvas.style.cursor = 'grabbing'
    })

    canvas.addEventListener('mousemove', (e) => {
      if (!isDraggingRFM) return

      const deltaX = e.clientX - lastXRFM
      const deltaY = e.clientY - lastYRFM

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
            resampleChartRFM(chart)
          }, 50)
        }
      }

      lastXRFM = e.clientX
      lastYRFM = e.clientY
    })

    canvas.addEventListener('mouseup', () => {
      isDraggingRFM = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('mouseleave', (e) => {
      isDraggingRFM = false
      canvas.style.cursor = 'default'
      
      if (e.relatedTarget) {
        e.relatedTarget.style.cursor = 'default'
      }
    })

    canvas.addEventListener('mouseenter', () => {
      if (!isDraggingRFM) {
        canvas.style.cursor = 'grab'
      }
    })

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDraggingRFM = true
        lastXRFM = e.touches[0].clientX
        lastYRFM = e.touches[0].clientY
        canvas.style.cursor = 'grabbing'
        e.preventDefault()
      }
    })

    canvas.addEventListener('touchmove', (e) => {
      if (!isDraggingRFM || e.touches.length !== 1) return

      const deltaX = e.touches[0].clientX - lastXRFM
      const deltaY = e.touches[0].clientY - lastYRFM

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
            resampleChartRFM(chart)
          }, 50)
        }
      }

      lastXRFM = e.touches[0].clientX
      lastYRFM = e.touches[0].clientY
      e.preventDefault()
    })

    canvas.addEventListener('touchend', () => {
      isDraggingRFM = false
      canvas.style.cursor = 'grab'
    })

    canvas.addEventListener('touchcancel', () => {
      isDraggingRFM = false
      canvas.style.cursor = 'default'
    })
  }

  function resampleChartRFM(chart) {
    if (!chart || !currentFunctionRFM) return
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
        const y = currentFunctionRFM.evaluate({ x: x })
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

  function regulaFalsiModificadaMethod(a, b, epsilon, maxIter) {
    const iterations = []
    let ai = a
    let bi = b
    let i = 0

    // Inicializar F, G, w según el algoritmo
    let F = currentFunctionRFM.evaluate({ x: ai })
    let G = currentFunctionRFM.evaluate({ x: bi })
    let w = F

    while (i < maxIter) {
      i++

      // Calcular f(a) y f(b)
      const fai = currentFunctionRFM.evaluate({ x: ai })
      const fbi = currentFunctionRFM.evaluate({ x: bi })

      // Fórmula de Regula Falsi Modificada: c = (a*G - b*F) / (G - F)
      const ci = (ai * G - bi * F) / (G - F)
      const fci = currentFunctionRFM.evaluate({ x: ci })

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
        G = fci
        // Si w * G > 0, entonces F = F / 2
        if (w * G > 0) {
          F = F / 2
        }
      } else {
        // Sino, a = c
        ai = ci
        F = fci
        // Si w * F > 0, entonces G = G / 2
        if (w * F > 0) {
          G = G / 2
        }
      }

      w = fci
    }

    // Si llegamos aquí, alcanzamos el máximo de iteraciones
    const fai = currentFunctionRFM.evaluate({ x: ai })
    const fbi = currentFunctionRFM.evaluate({ x: bi })
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
    const xMin = Math.max(Math.min(a, b) - 2, -50)
    const xMax = Math.min(Math.max(a, b) + 2, 50)
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
                  resampleChartRFM(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando resultado al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChartRFM(chart)
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
          if (canvas && !isDraggingRFM) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    addDragPanFunctionalityRFM(resultChartRFM)
  }
})()