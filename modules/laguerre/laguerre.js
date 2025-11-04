// Módulo para calcular cotas de Laguerre de raíces de polinomios
;(() => {
  const math = window.math

  window.initializeLaguerre = () => {
    console.log('[v0] Inicializando módulo Laguerre...')

    const degreeInput = document.getElementById('laguerre-degree')
    const generateBtn = document.getElementById('generate-coefficients-btn-laguerre')
    const calculateBtn = document.getElementById('laguerre-calculate-btn')
    const testBtn = document.getElementById('test-btn-laguerre')
    const coefficientsContainer = document.getElementById('coefficients-container-laguerre')
    const resultsSection = document.getElementById('results-section-laguerre')
    const resetZoomBtn = document.getElementById('reset-zoom-laguerre')

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
        
        const bounds = calculateLaguerreBounds(coefficients)
        currentBounds = bounds
        displayLaguerreResults(bounds, coefficients)
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
          const inputs = document.querySelectorAll('#coefficients-inputs-laguerre input')
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
      const container = document.getElementById('coefficients-inputs-laguerre')
      container.innerHTML = ''

      for (let i = 0; i <= degree; i++) {
        const exp = degree - i
        const div = document.createElement('div')
        div.className = 'coefficient-input'
        
        div.innerHTML = `
          <input type="number" id="coef-laguerre-${i}" step="0.1" placeholder="0" value="${i === 0 ? '1' : '0'}">
          <label for="coef-laguerre-${i}">a<sub>${i}</sub> (x<sup>${exp}</sup>)</label>
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

      document.getElementById('polynomial-preview-laguerre').innerHTML = polynomialStr
    }

    function collectCoefficients() {
      const degree = parseInt(degreeInput.value)
      const coefficients = []

      for (let i = 0; i <= degree; i++) {
        const input = document.getElementById(`coef-laguerre-${i}`)
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

    function calculateLaguerreBounds(coefficients) {
      // Implementación del algoritmo de Laguerre basado en el código Python
      
      function normalizeSign(coef) {
        if (!coef.length) return coef
        if (coef[0] < 0) {
          return coef.map(c => -c)
        }
        return coef
      }

      function syntheticDivision(coefs, L) {
        if (!coefs || coefs.length === 0) {
          return [[], 0]
        }
        
        const b = []
        b.push(coefs[0])
        
        for (let i = 1; i < coefs.length - 1; i++) {
          const bi = coefs[i] + b[b.length - 1] * L
          b.push(bi)
        }
        
        let r = coefs[coefs.length - 1]
        if (coefs.length >= 2) {
          r += b[b.length - 1] * L
        }
        
        return [b, r]
      }

      function laguerreBound(coefs, maxL = 10000) {
        if (!coefs || coefs.length === 0) {
          return null
        }
        
        if (coefs[0] === 0) {
          throw new Error("El coeficiente principal a₀ debe ser diferente de cero")
        }
        
        const normalizedCoefs = normalizeSign(coefs)
        let L = 1
        
        while (L <= maxL) {
          const [b, r] = syntheticDivision(normalizedCoefs, L)
          
          // Verificar si todos los coeficientes del cociente y el resto son positivos
          let allPositive = true
          
          for (const val of b) {
            if (val <= 0) {
              allPositive = false
              break
            }
          }
          
          if (r <= 0) {
            allPositive = false
          }
          
          if (allPositive) {
            return L
          }
          
          L++
        }
        
        return null
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

      // 1) L para el polinomio original (asegurar a₀ > 0)
      const c0 = normalizeSign(coefficients)
      const L_orig = laguerreBound(c0)

      // 2) L₁ mediante cambio t^n * P(1/t): invertir coeficientes
      const p1 = polyChangeInv(coefficients)
      const p1_norm = normalizeSign(p1)
      const L_p1 = laguerreBound(p1_norm)
      let L1 = null
      if (L_p1 !== null && L_p1 !== 0) {
        L1 = 1.0 / L_p1
      }

      // 3) L₂ mediante t^n * P(-1/t)
      const p2 = polyChangeInvNeg(coefficients)
      const p2_norm = normalizeSign(p2)
      const L_p2 = laguerreBound(p2_norm)
      let L2 = null
      if (L_p2 !== null && L_p2 !== 0) {
        L2 = -1.0 / L_p2
      }

      // 4) L₃ mediante P(-t)
      const p3 = polyChangeNeg(coefficients)
      const p3_norm = normalizeSign(p3)
      const L_p3 = laguerreBound(p3_norm)
      let L3 = null
      if (L_p3 !== null) {
        L3 = -L_p3
      }

      return [L_orig, L1, L2, L3]
    }

    function displayLaguerreResults(bounds, coefficients) {
      const [L_orig, L1, L2, L3] = bounds

      function formatBound(value) {
        if (value === null) return 'No aplicable'
        if (value === undefined) return 'No calculable'
        return value.toFixed(6)
      }

      document.getElementById('L-plus-result').textContent = formatBound(L_orig)
      document.getElementById('L1-plus-result').textContent = formatBound(L1)
      document.getElementById('L2-minus-result').textContent = formatBound(L2)
      document.getElementById('L3-minus-result').textContent = formatBound(L3)

      // Mostrar intervalos de búsqueda
      let positiveInterval = 'No hay raíces positivas'
      let negativeInterval = 'No hay raíces negativas'

      if (L1 !== null && L_orig !== null) {
        positiveInterval = `(${L1.toFixed(4)}, ${L_orig.toFixed(4)})`
      }

      if (L2 !== null && L3 !== null) {
        negativeInterval = `(${L2.toFixed(4)}, ${L3.toFixed(4)})`
      }

      document.getElementById('positive-interval-laguerre').textContent = positiveInterval
      document.getElementById('negative-interval-laguerre').textContent = negativeInterval
      document.getElementById('max-real-roots-laguerre').textContent = coefficients.length - 1
    }

    function plotPolynomialWithBounds(coefficients, bounds) {
      const canvas = document.getElementById('laguerre-chart')
      const ctx = canvas.getContext('2d')

      if (currentChart) {
        currentChart.destroy()
      }

      const [L_orig, L1, L2, L3] = bounds

      // Determinar rango de visualización basado en las cotas
      let xMin = -25
      let xMax = 25
      const yMin = -50
      const yMax = 50

      // Ajustar rango X basado en las cotas si existen
      if (L_orig !== null) {
        xMax = Math.max(xMax, L_orig + 5)
      }
      if (L3 !== null) {
        xMin = Math.min(xMin, L3 - 5)
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
      if (L1 !== null) {
        boundDatasets.push(createVerticalLineDataset(L1, '#6bcf7f', 'L₁ (Cota inf. positiva)'))
      }
      if (L_orig !== null) {
        boundDatasets.push(createVerticalLineDataset(L_orig, '#ff6b6b', 'L (Cota sup. positiva)'))
      }

      // Líneas verticales para cotas negativas
      if (L2 !== null) {
        boundDatasets.push(createVerticalLineDataset(L2, '#51cf66', 'L₂ (Cota sup. negativa)'))
      }
      if (L3 !== null) {
        boundDatasets.push(createVerticalLineDataset(L3, '#ff8787', 'L₃ (Cota inf. negativa)'))
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
              borderColor: '#ff6b9d',
              backgroundColor: 'rgba(255, 107, 157, 0.2)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0.1,
              fill: false,
            },
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

      // Agregar funcionalidad de arrastre
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

    console.log('[v0] Módulo Laguerre inicializado')
  }
})()