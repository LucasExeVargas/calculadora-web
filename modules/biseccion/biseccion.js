// Módulo de Bisección - Usa math.js para parsear funciones y Chart.js para graficar
// Las librerías se cargan globalmente desde CDN en index.html
;(() => {
  let currentFunctionBis = null
  let currentChartBis = null
  let resultChartBis = null
  const math = window.math // Declare the math variable

  window.initializeBiseccion = () => {
    console.log("[v0] Inicializando módulo de Bisección...")

    const graphBtn = document.getElementById("graph-btn-bis")
    const methodBtn = document.getElementById("method-btn-bis")
    const functionInput = document.getElementById("function-input-bis")
    const resetZoomFunc = document.getElementById("reset-zoom-func-bis")
    const resetZoomResult = document.getElementById("reset-zoom-result-bis")

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

        currentFunctionBis = math.compile(functionStr)
        const testValue = currentFunctionBis.evaluate({ x: 0 })

        document.getElementById("graph-section-bis").style.display = "block"
        document.getElementById("results-section-bis").style.display = "none"

        plotFunctionBis()
      } catch (error) {
        alert("Error en la función: " + error.message + "\n\nAsegúrate de usar la sintaxis correcta.")
      }
    })

    // Botones de casos de prueba por dificultad
    const testEasy = document.getElementById("test-easy-bis")
    const testMedium = document.getElementById("test-medium-bis")
    const testHard = document.getElementById("test-hard-bis")

    // Fácil: f(x) = x - 2, intervalo [1,3], ε = 0.01
    if (testEasy) {
      testEasy.addEventListener("click", () => {
        const funcStr = "x - 2"
        functionInput.value = funcStr
        document.getElementById("param-a-bis").value = "1"
        document.getElementById("param-b-bis").value = "3"
        document.getElementById("param-error-bis").value = "0.01"

        graphBtn.click()
        setTimeout(() => document.getElementById("method-btn-bis").click(), 200)
      })
    }

    // Medio: f(x) = x^3 - x - 2, intervalo [1,2], ε = 0.001
    if (testMedium) {
      testMedium.addEventListener("click", () => {
        const funcStr = "x^3 - x - 2"
        functionInput.value = funcStr
        document.getElementById("param-a-bis").value = "1"
        document.getElementById("param-b-bis").value = "2"
        document.getElementById("param-error-bis").value = "0.001"

        graphBtn.click()
        setTimeout(() => document.getElementById("method-btn-bis").click(), 200)
      })
    }

    // Difícil: f(x) = e^(-x) - x, intervalo [0,1], ε = 1e-7
    if (testHard) {
      testHard.addEventListener("click", () => {
        const funcStr = "e^(-x) - x"
        functionInput.value = funcStr
        document.getElementById("param-a-bis").value = "0"
        document.getElementById("param-b-bis").value = "1"
        document.getElementById("param-error-bis").value = "0.0000001"

        graphBtn.click()
        setTimeout(() => document.getElementById("method-btn-bis").click(), 200)
      })
    }

    // Botón Usar método
    methodBtn.addEventListener("click", () => {
      const a = Number.parseFloat(document.getElementById("param-a-bis").value)
      const b = Number.parseFloat(document.getElementById("param-b-bis").value)
      const error = Number.parseFloat(document.getElementById("param-error-bis").value)
      const maxIter = Number.parseInt(document.getElementById("param-max-iter-bis").value)

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
        const fa = currentFunctionBis.evaluate({ x: a })
        const fb = currentFunctionBis.evaluate({ x: b })

        if (fa * fb > 0) {
          alert(
            "Error: f(a) · f(b) > 0\n\nNo existe una raíz en el intervalo [a, b] según el método de Bisección.\nPor favor, elige otro intervalo.",
          )
          return
        }

        const result = bisectionMethod(a, b, error, maxIter)
        displayResultsBis(result, a, b)
      } catch (error) {
        alert("Error al ejecutar el método: " + error.message)
      }
    })

    // Botones de reset zoom
    if (resetZoomFunc) {
      resetZoomFunc.addEventListener("click", () => {
        if (currentChartBis) {
          currentChartBis.resetZoom()
        }
      })
    }

    if (resetZoomResult) {
      resetZoomResult.addEventListener("click", () => {
        if (resultChartBis) {
          resultChartBis.resetZoom()
        }
      })
    }

    console.log("[v0] Módulo de Bisección inicializado correctamente")
  }

  function plotFunctionBis() {
    const canvas = document.getElementById("function-chart-bis")
    const ctx = canvas.getContext("2d")

    if (currentChartBis) {
      currentChartBis.destroy()
    }

    const points = []
    const xMin = -50
    const xMax = 50
    const step = 0.5

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionBis.evaluate({ x: x })
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

    currentChartBis = new window.Chart(ctx, {
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
                  resampleChart(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChart(chart)
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
          if (canvas) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    // Agregar evento personalizado para arrastre con clic
    addDragPanFunctionality(currentChartBis)
  }

  function plotFunctionWithRootBis(root, a, b) {
    const canvas = document.getElementById("result-chart-bis")
    const ctx = canvas.getContext("2d")

    if (resultChartBis) {
      resultChartBis.destroy()
    }

    const points = []
    const xMin = Math.max(Math.min(a, b) - 2, -50)
    const xMax = Math.min(Math.max(a, b) + 2, 50)
    const step = (xMax - xMin) / 200

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = currentFunctionBis.evaluate({ x: x })
        if (isFinite(y)) {
          points.push({ x: x, y: y })
        }
      } catch (e) {
        // Ignorar puntos donde la función no está definida
      }
    }

    resultChartBis = new window.Chart(ctx, {
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
            data: [{ x: a, y: currentFunctionBis.evaluate({ x: a }) }],
            borderColor: "#ff6b6b",
            backgroundColor: "#ff6b6b",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Punto b",
            data: [{ x: b, y: currentFunctionBis.evaluate({ x: b }) }],
            borderColor: "#ffd93d",
            backgroundColor: "#ffd93d",
            pointRadius: 8,
            pointStyle: "circle",
            showLine: false,
          },
          {
            label: "Raíz aproximada",
            data: [{ x: root, y: currentFunctionBis.evaluate({ x: root }) }],
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
                  resampleChart(chart)
                } catch (e) {
                  console.error('[v0] Error remuestreando resultado al hacer zoom:', e)
                }
              },
              onPan: ({chart}) => {
                try {
                  resampleChart(chart)
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
          if (canvas) {
            canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
          }
        },
        events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
      },
    })

    // Agregar evento personalizado para arrastre con clic
    addDragPanFunctionality(resultChartBis)
  }

  // Función para agregar funcionalidad de arrastre con clic
    // Función para agregar funcionalidad de arrastre con clic - CORREGIDA
  function addDragPanFunctionality(chart) {
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
          const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * -1  // Cambiado a -1

          // Actualizar los límites de los ejes
          chart.options.scales.x.min += deltaUnitsX
          chart.options.scales.x.max += deltaUnitsX
          chart.options.scales.y.min += deltaUnitsY  // Cambiado a +
          chart.options.scales.y.max += deltaUnitsY  // Cambiado a +

          chart.update()

          // Remuestrear después de mover
          setTimeout(() => {
            resampleChart(chart)
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

    canvas.addEventListener('mouseleave', () => {
      isDragging = false
      canvas.style.cursor = 'default'
    })

    // Soporte para touch devices - CORREGIDO
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true
        lastX = e.touches[0].clientX
        lastY = e.touches[0].clientY
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
            resampleChart(chart)
          }, 50)
        }
      }

      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
      e.preventDefault()
    })

    canvas.addEventListener('touchend', () => {
      isDragging = false
    })
  }

  // Re-muestrea el dataset principal del gráfico usando los límites actuales de la escala X
  function resampleChart(chart) {
    if (!chart || !currentFunctionBis) return
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
        const y = currentFunctionBis.evaluate({ x: x })
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

  function bisectionMethod(a, b, epsilon, maxIter) {
    const iterations = []
    let ai = a
    let bi = b
    let i = 0

    while (i < maxIter) {
      i++

      // Calcular f(a) y f(b)
      const fai = currentFunctionBis.evaluate({ x: ai })
      const fbi = currentFunctionBis.evaluate({ x: bi })

      // Fórmula de Bisección: c = (a + b) / 2
      const ci = (ai + bi) / 2
      const fci = currentFunctionBis.evaluate({ x: ci })

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
    const finalC = (ai + bi) / 2

    return {
      root: finalC,
      iterations: iterations,
      converged: false,
    }
  }

  function displayResultsBis(result, initialA, initialB) {
    document.getElementById("results-section-bis").style.display = "block"

    const tbody = document.getElementById("iterations-body-bis")
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

    document.getElementById("final-root-bis").textContent = result.root.toFixed(10)
    document.getElementById("final-iterations-bis").textContent = result.iterations.length
    document.getElementById("final-error-bis").textContent = Math.abs(
      currentFunctionBis.evaluate({ x: result.root }),
    ).toFixed(10)

    plotFunctionWithRootBis(result.root, initialA, initialB)
  }
})()