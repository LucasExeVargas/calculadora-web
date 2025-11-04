// Módulo para calcular cotas de Newton de raíces de polinomios
;(() => {
  const math = window.math

  window.initializeNewtonCotas = () => {
    console.log('[v0] Inicializando módulo Newton Cotas...')

    const degreeInput = document.getElementById('newton-cotas-degree')
    const generateBtn = document.getElementById('generate-coefficients-btn-newton-cotas')
    const calculateBtn = document.getElementById('newton-cotas-calculate-btn')
    const testBtn = document.getElementById('test-btn-newton-cotas')
    const coefficientsContainer = document.getElementById('coefficients-container-newton-cotas')
    const resultsSection = document.getElementById('results-section-newton-cotas')
    const resetZoomBtn = document.getElementById('reset-zoom-newton-cotas')

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
        
        const bounds = calculateNewtonBounds(coefficients)
        currentBounds = bounds
        displayNewtonResults(bounds, coefficients)
        plotPolynomialWithBounds(coefficients, bounds)
        resultsSection.style.display = 'block'
      } catch (err) {
        alert('Error calculando las cotas: ' + err.message)
      }
    })

    // Caso de prueba: 8x³ + 12x² - 26x - 15 (del ejemplo Python)
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        // Poner grado y generar inputs
        degreeInput.value = '3'
        // Reutilizar el botón generar para crear los inputs de coeficientes
        generateBtn.click()

        // Rellenar coeficientes y calcular tras un pequeño retardo
        setTimeout(() => {
          const inputs = document.querySelectorAll('#coefficients-inputs-newton-cotas input')
          if (inputs && inputs.length >= 4) {
            inputs[0].value = '8'    // a₀ (x³)
            inputs[1].value = '12'   // a₁ (x²)
            inputs[2].value = '-26'  // a₂ (x)
            inputs[3].value = '-15'  // a₃ (término independiente)
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
      const container = document.getElementById('coefficients-inputs-newton-cotas')
      container.innerHTML = ''

      for (let i = 0; i <= degree; i++) {
        const exp = degree - i
        const div = document.createElement('div')
        div.className = 'coefficient-input'
        
        div.innerHTML = `
          <input type="number" id="coef-newton-cotas-${i}" step="0.1" placeholder="0" value="${i === 0 ? '1' : '0'}">
          <label for="coef-newton-cotas-${i}">a<sub>${i}</sub> (x<sup>${exp}</sup>)</label>
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

      document.getElementById('polynomial-preview-newton-cotas').innerHTML = polynomialStr
    }

    function collectCoefficients() {
      const degree = parseInt(degreeInput.value)
      const coefficients = []

      for (let i = 0; i <= degree; i++) {
        const input = document.getElementById(`coef-newton-cotas-${i}`)
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

    function calculateNewtonBounds(coefficients) {
      // Implementación del algoritmo de Newton basado en el código Python
      
      function normalizeSign(coef) {
        if (!coef.length) return coef
        if (coef[0] < 0) {
          return coef.map(c => -c)
        }
        return coef
      }

      function derivativeCoeffs(coefs) {
        // Return list of derivative coefficient lists from P to constant
        const res = []
        let cur = [...coefs]
        const n = cur.length - 1
        
        while (true) {
          res.push(cur)
          if (cur.length === 1) {
            break
          }
          // compute derivative
          const deriv = []
          const deg = cur.length - 1
          for (let i = 0; i < cur.length - 1; i++) {
            const power = deg - i
            deriv.push(cur[i] * power)
          }
          cur = deriv
        }
        return res
      }

      function evalPoly(coefs, x) {
        // Horner evaluation of polynomial coefficients at x
        if (!coefs.length) return 0.0
        let val = 0.0
        for (let i = 0; i < coefs.length; i++) {
          val = val * x + coefs[i]
        }
        return val
      }

      function findAlphaByDerivatives(coefs, maxAlpha = 1000) {
        if (!coefs.length) return null
        if (coefs[0] === 0) {
          throw new Error("El coeficiente principal a₀ debe ser diferente de cero")
        }

        const normalizedCoefs = normalizeSign(coefs)
        const derivs = derivativeCoeffs(normalizedCoefs)

        for (let alpha = 1; alpha <= maxAlpha; alpha++) {
          let allPos = true
          for (let j = 0; j < derivs.length; j++) {
            const dcoefs = derivs[j]
            try {
              const v = evalPoly(dcoefs, alpha)
              if (!(v > 0)) {
                allPos = false
                break
              }
            } catch (e) {
              allPos = false
              break
            }
          }
          if (allPos) {
            return alpha
          }
        }
        return null
      }

      function polyChangeInv(coef) {
        return [...coef].reverse()
      }

      function polyChangeInvNeg(coef) {
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

      // 1) α para el polinomio original (asegurar a₀ > 0)
      const c0 = normalizeSign(coefficients)
      const alpha_orig = findAlphaByDerivatives(c0)

      // 2) α₁ mediante cambio t^n * P(1/t): invertir coeficientes
      const p1 = polyChangeInv(coefficients)
      const p1_norm = normalizeSign(p1)
      const alpha_p1 = findAlphaByDerivatives(p1_norm)
      let alpha1 = null
      if (alpha_p1 !== null && alpha_p1 !== 0) {
        alpha1 = 1.0 / alpha_p1
      }

      // 3) α₂ mediante t^n * P(-1/t)
      const p2 = polyChangeInvNeg(coefficients)
      const p2_norm = normalizeSign(p2)
      const alpha_p2 = findAlphaByDerivatives(p2_norm)
      let alpha2 = null
      if (alpha_p2 !== null && alpha_p2 !== 0) {
        alpha2 = -1.0 / alpha_p2
      }

      // 4) α₃ mediante P(-t)
      const p3 = polyChangeNeg(coefficients)
      const p3_norm = normalizeSign(p3)
      const alpha_p3 = findAlphaByDerivatives(p3_norm)
      let alpha3 = null
      if (alpha_p3 !== null) {
        alpha3 = -alpha_p3
      }

      return [alpha_orig, alpha1, alpha2, alpha3]
    }

    function displayNewtonResults(bounds, coefficients) {
      const [alpha_orig, alpha1, alpha2, alpha3] = bounds

      function formatBound(value) {
        if (value === null) return 'No aplicable'
        if (value === undefined) return 'No calculable'
        return value.toFixed(6)
      }

      document.getElementById('alpha-plus-result').textContent = formatBound(alpha_orig)
      document.getElementById('alpha1-plus-result').textContent = formatBound(alpha1)
      document.getElementById('alpha2-minus-result').textContent = formatBound(alpha2)
      document.getElementById('alpha3-minus-result').textContent = formatBound(alpha3)

      // Mostrar intervalos de búsqueda
      let positiveInterval = 'No hay raíces positivas'
      let negativeInterval = 'No hay raíces negativas'

      if (alpha1 !== null && alpha_orig !== null) {
        positiveInterval = `(${alpha1.toFixed(4)}, ${alpha_orig.toFixed(4)})`
      }

      if (alpha2 !== null && alpha3 !== null) {
        negativeInterval = `(${alpha2.toFixed(4)}, ${alpha3.toFixed(4)})`
      }

      document.getElementById('positive-interval-newton-cotas').textContent = positiveInterval
      document.getElementById('negative-interval-newton-cotas').textContent = negativeInterval
      document.getElementById('max-real-roots-newton-cotas').textContent = coefficients.length - 1
    }

    function plotPolynomialWithBounds(coefficients, bounds) {
      const canvas = document.getElementById('newton-cotas-chart')
      const ctx = canvas.getContext('2d')

      if (currentChart) {
        currentChart.destroy()
      }

      const [alpha_orig, alpha1, alpha2, alpha3] = bounds

      // Determinar rango de visualización basado en las cotas
      let xMin = -25
      let xMax = 25
      const yMin = -50
      const yMax = 50

      // Ajustar rango X basado en las cotas si existen
      if (alpha_orig !== null) {
        xMax = Math.max(xMax, alpha_orig + 5)
      }
      if (alpha3 !== null) {
        xMin = Math.min(xMin, alpha3 - 5)
      }

      const polynomialData = []
      const step = (xMax - xMin) / 500

      // Generar datos del polinomio
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
      if (alpha1 !== null) {
        boundDatasets.push(createVerticalLineDataset(alpha1, '#6bcf7f', 'α₁ (Cota inf. positiva)'))
      }
      if (alpha_orig !== null) {
        boundDatasets.push(createVerticalLineDataset(alpha_orig, '#ff6b6b', 'α (Cota sup. positiva)'))
      }

      // Líneas verticales para cotas negativas
      if (alpha2 !== null) {
        boundDatasets.push(createVerticalLineDataset(alpha2, '#51cf66', 'α₂ (Cota sup. negativa)'))
      }
      if (alpha3 !== null) {
        boundDatasets.push(createVerticalLineDataset(alpha3, '#ff8787', 'α₃ (Cota inf. negativa)'))
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
              borderColor: '#9b59b6',
              backgroundColor: 'rgba(155, 89, 182, 0.2)',
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

      const samples = 800
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

    console.log('[v0] Módulo Newton Cotas inicializado')
  }
})()