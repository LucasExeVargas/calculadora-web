// Módulo para calcular cotas de Lagrange de raíces de polinomios
;(() => {
  const math = window.math

  window.initializeLagrange = () => {
    console.log('[v0] Inicializando módulo Cotas de Lagrange...')

    const degreeInput = document.getElementById('lagrange-degree')
    const generateBtn = document.getElementById('generate-coefficients-btn')
    const calculateBtn = document.getElementById('lagrange-calculate-btn')
    const testBtn = document.getElementById('test-btn-lagrange')
    const coefficientsContainer = document.getElementById('coefficients-container')
    const resultsSection = document.getElementById('results-section-lagrange')
    const resetZoomBtn = document.getElementById('reset-zoom-lagrange')

    let currentPolynomial = null
    let currentChart = null
    let currentBounds = null

    if (!generateBtn || !calculateBtn) {
      console.error('[v0] Elementos necesarios no encontrados')
      return
    }

    // Generar inputs para coeficientes
    generateBtn.addEventListener('click', () => {
      const degree = parseInt(degreeInput.value)
      if (degree < 1 || degree > 10) {
        alert('El grado debe estar entre 1 y 10')
        return
      }

      generateCoefficientInputs(degree)
      coefficientsContainer.style.display = 'block'
      resultsSection.style.display = 'none'
      updatePolynomialPreview()
    })

    // Calcular cotas
    calculateBtn.addEventListener('click', () => {
      const coefficients = collectCoefficients()
      if (!coefficients) {
        alert('Por favor, completa todos los coeficientes')
        return
      }

      try {
        // Compilar el polinomio
        const polyStr = buildPolynomialString(coefficients)
        currentPolynomial = math.compile(polyStr)
        
        const bounds = calculateLagrangeBounds(coefficients)
        currentBounds = bounds
        displayLagrangeResults(bounds, coefficients)
        plotPolynomialWithBounds(coefficients, bounds)
        resultsSection.style.display = 'block'
      } catch (err) {
        alert('Error calculando las cotas: ' + err.message)
      }
    })

    // Caso de prueba: x² - 3x + 2 (raíces: 1 y 2)
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        // Poner grado y generar inputs
        degreeInput.value = '2'
        // Reutilizar el botón generar para crear los inputs de coeficientes
        generateBtn.click()

        // Rellenar coeficientes y calcular tras un pequeño retardo
        setTimeout(() => {
          const inputs = document.querySelectorAll('#coefficients-inputs input')
          if (inputs && inputs.length >= 3) {
            inputs[0].value = '1'   // a₀ (x²)
            inputs[1].value = '-3'  // a₁ (x)
            inputs[2].value = '2'   // a₂ (término independiente)
            coefficientsContainer.style.display = 'block'
            updatePolynomialPreview()
            // Ejecutar cálculo y graficado
            calculateBtn.click()
          }
        }, 150)
      })
    }

    // Reset zoom del gráfico
    if (resetZoomBtn) {
      resetZoomBtn.addEventListener('click', () => {
        if (currentChart) {
          currentChart.resetZoom()
        }
      })
    }

    function generateCoefficientInputs(degree) {
      const container = document.getElementById('coefficients-inputs')
      container.innerHTML = ''

      for (let i = 0; i <= degree; i++) {
        const exp = degree - i
        const div = document.createElement('div')
        div.className = 'coefficient-input'
        
        div.innerHTML = `
          <input type="number" id="coef-${i}" step="0.1" placeholder="0" value="${i === 0 ? '1' : '0'}">
          <label for="coef-${i}">a<sub>${i}</sub> (x<sup>${exp}</sup>)</label>
        `
        
        const input = div.querySelector('input')
        input.addEventListener('input', updatePolynomialPreview)
        
        container.appendChild(div)
      }
    }

    function buildPolynomialString(coefficients) {
      const degree = coefficients.length - 1
      let terms = []

      for (let i = 0; i <= degree; i++) {
        const coef = coefficients[i]
        const exp = degree - i

        if (coef === 0) continue

        let term = ''
        if (exp === 0) {
          term = coef.toString()
        } else if (exp === 1) {
          term = coef === 1 ? 'x' : coef === -1 ? '-x' : coef + '*x'
        } else {
          term = coef === 1 ? `x^${exp}` : coef === -1 ? `-x^${exp}` : `${coef}*x^${exp}`
        }

        terms.push(term)
      }

      return terms.join(' + ').replace(/\+\s\-/g, '- ')
    }

    function updatePolynomialPreview() {
      const coefficients = collectCoefficients()
      if (!coefficients) return

      const degree = coefficients.length - 1
      let polynomialStr = 'P(x) = '

      for (let i = 0; i <= degree; i++) {
        const coef = coefficients[i]
        const exp = degree - i

        if (coef === 0) continue

        // Signo
        if (i > 0) {
          polynomialStr += coef >= 0 ? ' + ' : ' - '
        } else if (coef < 0) {
          polynomialStr += '-'
        }

        // Coeficiente (sin mostrar 1)
        const absCoef = Math.abs(coef)
        if (absCoef !== 1 || exp === 0) {
          polynomialStr += Number.isInteger(absCoef) ? absCoef : absCoef.toFixed(2)
        }

        // Variable y exponente
        if (exp > 0) {
          polynomialStr += 'x'
          if (exp > 1) {
            polynomialStr += `<sup>${exp}</sup>`
          }
        }
      }

      document.getElementById('polynomial-preview').innerHTML = polynomialStr
    }

    function collectCoefficients() {
      const degree = parseInt(degreeInput.value)
      const coefficients = []

      for (let i = 0; i <= degree; i++) {
        const input = document.getElementById(`coef-${i}`)
        if (!input || input.value === '') {
          return null
        }
        coefficients.push(parseFloat(input.value))
      }

      // Verificar que el coeficiente principal no sea cero
      if (coefficients[0] === 0) {
        alert('El coeficiente principal (a₀) no puede ser cero')
        return null
      }

      return coefficients
    }

    function calculateLagrangeBounds(coefficients) {
      // Implementación del algoritmo de Lagrange basado en el código Python
      
      function normalizeSign(coef) {
        if (!coef.length) return coef
        if (coef[0] < 0) {
          return coef.map(c => -c)
        }
        return coef
      }

      function lambda2PlusFromCoefs(coef) {
        if (!coef.length) return null
        const a0 = coef[0]
        if (a0 === 0) return null

        // Encontrar coeficientes negativos y el primer índice negativo k
        const negatives = []
        let k = null
        
        for (let idx = 0; idx < coef.length; idx++) {
          const c = coef[idx]
          if (c < 0) {
            negatives.push(Math.abs(c))
            if (k === null) {
              k = idx
            }
          }
        }

        if (negatives.length === 0) {
          // Sin coeficientes negativos -> A = 0 -> lambda2_plus = 1
          return 1.0
        }

        const A = Math.max(...negatives)
        // k debe ser > 0 (si el primer negativo es a0 es imposible porque a0 > 0 después de normalizar)
        if (k === null || k === 0) {
          return null
        }

        try {
          return 1.0 + Math.pow(A / a0, 1.0 / k)
        } catch (e) {
          return null
        }
      }

      function polyChangeInv(coef) {
        // Calcular coeficientes de t^n * P(1/t)
        return [...coef].reverse()
      }

      function polyChangeInvNeg(coef) {
        // Calcular coeficientes de t^n * P(-1/t)
        const n = coef.length - 1
        const rev = [...coef].reverse()
        const out = []
        
        for (let j = 0; j < rev.length; j++) {
          const power = n - j
          const sign = (power % 2 === 1) ? -1 : 1
          out.push(rev[j] * sign)
        }
        return out
      }

      function polyChangeNeg(coef) {
        // Calcular coeficientes de P(-t)
        const n = coef.length - 1
        const out = []
        
        for (let i = 0; i < coef.length; i++) {
          const degree = n - i
          const sign = (degree % 2 === 1) ? -1 : 1
          out.push(coef[i] * sign)
        }
        return out
      }

      // Validación
      if (!coefficients || coefficients.length === 0) {
        return [null, null, null, null]
      }

      if (coefficients[0] === 0) {
        throw new Error("El coeficiente principal a₀ debe ser diferente de cero")
      }

      // 1) lambda2_plus para el polinomio original (asegurar a₀ > 0)
      const c0 = normalizeSign(coefficients)
      const lambda2_plus = lambda2PlusFromCoefs(c0)

      // 2) lambda1_plus mediante cambio t^n * P(1/t): invertir coeficientes
      const p1 = polyChangeInv(coefficients)
      const p1_norm = normalizeSign(p1)
      const lambda2_p1 = lambda2PlusFromCoefs(p1_norm)
      let lambda1_plus = null
      if (lambda2_p1 !== null && lambda2_p1 !== 0) {
        lambda1_plus = 1.0 / lambda2_p1
      }

      // 3) lambda2_minus mediante t^n * P(-1/t)
      const p2 = polyChangeInvNeg(coefficients)
      const p2_norm = normalizeSign(p2)
      const lambda2_p2 = lambda2PlusFromCoefs(p2_norm)
      let lambda2_minus = null
      if (lambda2_p2 !== null && lambda2_p2 !== 0) {
        lambda2_minus = -1.0 / lambda2_p2
      }

      // 4) lambda1_minus mediante P(-t)
      const p3 = polyChangeNeg(coefficients)
      const p3_norm = normalizeSign(p3)
      const lambda2_p3 = lambda2PlusFromCoefs(p3_norm)
      let lambda1_minus = null
      if (lambda2_p3 !== null) {
        lambda1_minus = -lambda2_p3
      }

      return [lambda2_plus, lambda1_plus, lambda2_minus, lambda1_minus]
    }

    function displayLagrangeResults(bounds, coefficients) {
      const [lambda2_plus, lambda1_plus, lambda2_minus, lambda1_minus] = bounds

      function formatBound(value) {
        if (value === null) return 'No aplicable'
        if (value === undefined) return 'No calculable'
        return value.toFixed(6)
      }

      document.getElementById('lambda2-plus-result').textContent = formatBound(lambda2_plus)
      document.getElementById('lambda1-plus-result').textContent = formatBound(lambda1_plus)
      document.getElementById('lambda2-minus-result').textContent = formatBound(lambda2_minus)
      document.getElementById('lambda1-minus-result').textContent = formatBound(lambda1_minus)

      // Mostrar intervalos de búsqueda
      let positiveInterval = 'No hay raíces positivas'
      let negativeInterval = 'No hay raíces negativas'

      if (lambda1_plus !== null && lambda2_plus !== null) {
        positiveInterval = `(${lambda1_plus.toFixed(4)}, ${lambda2_plus.toFixed(4)})`
      }

      if (lambda2_minus !== null && lambda1_minus !== null) {
        negativeInterval = `(${lambda2_minus.toFixed(4)}, ${lambda1_minus.toFixed(4)})`
      }

      document.getElementById('positive-interval').textContent = positiveInterval
      document.getElementById('negative-interval').textContent = negativeInterval
      document.getElementById('max-real-roots').textContent = coefficients.length - 1
    }

    function plotPolynomialWithBounds(coefficients, bounds) {
      const canvas = document.getElementById('lagrange-chart')
      const ctx = canvas.getContext('2d')

      if (currentChart) {
        currentChart.destroy()
      }

      const [lambda2_plus, lambda1_plus, lambda2_minus, lambda1_minus] = bounds

      // Determinar rango de visualización basado en las cotas
      let xMin = -25
      let xMax = 25
      const yMin = -50
      const yMax = 50

      // Ajustar rango X basado en las cotas si existen
      if (lambda2_plus !== null) {
        xMax = Math.max(xMax, lambda2_plus + 5)
      }
      if (lambda1_minus !== null) {
        xMin = Math.min(xMin, lambda1_minus - 5)
      }

  const polynomialData = []
      const step = (xMax - xMin) / 500 // Más puntos para mejor visualización

      // Generar datos del polinomio (sin recortar en Y)
      for (let x = xMin; x <= xMax; x += step) {
        try {
          const y = currentPolynomial.evaluate({ x: x })
          if (isFinite(y)) {
            polynomialData.push({ x: x, y: y })
          }
        } catch (e) {
          // Ignorar puntos problemáticos
        }
      }

      // Crear datasets para las líneas de cotas
      const boundDatasets = []

      // Líneas verticales para cotas positivas
      if (lambda1_plus !== null) {
        boundDatasets.push(createVerticalLineDataset(lambda1_plus, '#6bcf7f', 'λ₁⁺ (Cota inf. positiva)'))
      }
      if (lambda2_plus !== null) {
        boundDatasets.push(createVerticalLineDataset(lambda2_plus, '#ff6b6b', 'λ₂⁺ (Cota sup. positiva)'))
      }

      // Líneas verticales para cotas negativas
      if (lambda2_minus !== null) {
        boundDatasets.push(createVerticalLineDataset(lambda2_minus, '#51cf66', 'λ₂⁻ (Cota sup. negativa)'))
      }
      if (lambda1_minus !== null) {
        boundDatasets.push(createVerticalLineDataset(lambda1_minus, '#ff8787', 'λ₁⁻ (Cota inf. negativa)'))
      }

      function createVerticalLineDataset(xValue, color, label) {
        const points = [
          { x: xValue, y: yMin },
          { x: xValue, y: yMax }
        ]
        
        return {
          label: label,
          data: points,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 3,
          borderDash: [8, 4],
          pointRadius: 0,
          fill: false,
          showLine: true
        }
      }

      currentChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Polinomio P(x)',
              data: polynomialData,
              borderColor: '#5b7cfa',
              backgroundColor: 'rgba(91, 124, 250, 0.2)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0.1,
              fill: false,
            },
            // Nota: no se incluye dataset para el eje X (y=0) porque
            // queremos mostrar únicamente el polinomio y las líneas de cotas.
            ...boundDatasets
          ]
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
              position: 'top',
              labels: {
                color: '#e0e0e0',
                font: {
                  size: 12
                },
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  if (context.dataset.label.includes('Polinomio')) {
                    return `P(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`
                  } else if (context.dataset.label.includes('Cota')) {
                    return `${context.dataset.label}: x = ${context.parsed.x.toFixed(4)}`
                  }
                  return `${context.dataset.label}`
                }
              }
            },
            zoom: {
              zoom: {
                wheel: {
                  enabled: true,
                },
                pinch: {
                  enabled: true,
                },
                mode: 'xy',
              },
              pan: {
                enabled: true,
                mode: 'xy',
                modifierKey: null,
              },
              limits: {
                x: { min: -100, max: 100 },
                y: { min: -100, max: 100 }
              }
            },
          },
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'x',
                color: '#e0e0e0',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              min: xMin,
              max: xMax,
              ticks: {
                color: '#b0b0b0',
                stepSize: 5
              },
              grid: {
                color: '#2a2a2a',
              },
            },
            y: {
              title: {
                display: true,
                text: 'P(x)',
                color: '#e0e0e0',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              min: yMin,
              max: yMax,
              ticks: {
                color: '#b0b0b0',
                stepSize: 10
              },
              grid: {
                color: '#2a2a2a',
              },
            },
          },
          onHover: (event, elements) => {
            const canvas = event.native?.target;
            if (canvas) {
              canvas.style.cursor = elements.length > 0 ? 'pointer' : 'grab';
            }
          },
          events: ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'],
        },
      })

      // Agregar funcionalidad de arrastre (similar a bisección)
      addDragPanFunctionality(currentChart)
    }

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
          const xScale = chart.scales.x
          const yScale = chart.scales.y

          if (xScale && yScale) {
            const pixelRangeX = xScale.max - xScale.min
            const pixelRangeY = yScale.max - yScale.min
            
            const canvasWidth = chart.width
            const canvasHeight = chart.height

            const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
            const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * -1

            chart.options.scales.x.min += deltaUnitsX
            chart.options.scales.x.max += deltaUnitsX
            chart.options.scales.y.min += deltaUnitsY
            chart.options.scales.y.max += deltaUnitsY

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

      // Soporte para touch devices
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

            const deltaUnitsX = (deltaX / canvasWidth) * pixelRangeX * -1
            const deltaUnitsY = (deltaY / canvasHeight) * pixelRangeY * -1

            chart.options.scales.x.min += deltaUnitsX
            chart.options.scales.x.max += deltaUnitsX
            chart.options.scales.y.min += deltaUnitsY
            chart.options.scales.y.max += deltaUnitsY

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

    function resampleChart(chart) {
      if (!chart || !currentPolynomial) return
      const xScale = chart.scales && chart.scales.x
      const yScale = chart.scales && chart.scales.y
      if (!xScale || !yScale) return
      
      let xMin = typeof xScale.min === 'number' ? xScale.min : -25
      let xMax = typeof xScale.max === 'number' ? xScale.max : 25
      const yMin = typeof yScale.min === 'number' ? yScale.min : -50
      const yMax = typeof yScale.max === 'number' ? yScale.max : 50

      if (!isFinite(xMin) || !isFinite(xMax) || xMin === xMax) {
        return
      }

      const samples = 800 // Más muestras para mejor calidad
      const step = (xMax - xMin) / samples
      const points = []
      for (let x = xMin; x <= xMax; x += step) {
        try {
          const y = currentPolynomial.evaluate({ x: x })
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

    

    console.log('[v0] Módulo Cotas de Lagrange inicializado')
  }
})()