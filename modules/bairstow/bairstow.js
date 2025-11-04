// Módulo para calcular raíces de polinomios usando el método de Bairstow
;(() => {
  const math = window.math

  window.initializeBairstow = () => {
    console.log('[v0] Inicializando módulo Bairstow...')

    const degreeInput = document.getElementById('bairstow-degree')
    const generateBtn = document.getElementById('generate-coefficients-btn-bairstow')
    const calculateBtn = document.getElementById('bairstow-calculate-btn')
    const testBtn = document.getElementById('test-btn-bairstow')
    const coefficientsContainer = document.getElementById('coefficients-container-bairstow')
    const resultsSection = document.getElementById('results-section-bairstow')
    const resetZoomBtn = document.getElementById('reset-zoom-bairstow')

    let currentPolynomial = null
    let currentChart = null
    let currentResults = null
    let iterationsHistory = []

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

    // Calcular raíces
    calculateBtn.addEventListener('click', () => {
      const coefficients = collectCoefficients()
      if (!coefficients) {
        alert('Por favor, completa todos los coeficientes')
        return
      }

      try {
        const r0 = parseFloat(document.getElementById('bairstow-r0').value) || 1.0
        const s0 = parseFloat(document.getElementById('bairstow-s0').value) || 1.0
        const tolerance = parseFloat(document.getElementById('bairstow-tolerance').value) || 1e-6

        // Compilar el polinomio
        const polyStr = buildPolynomialString(coefficients)
        currentPolynomial = math.compile(polyStr)
        
        const results = calculateBairstow(coefficients, r0, s0, tolerance)
        currentResults = results
        displayBairstowResults(results, coefficients)
        plotPolynomialWithRoots(coefficients, results)
        resultsSection.style.display = 'block'
      } catch (err) {
        alert('Error calculando las raíces: ' + err.message)
      }
    })

    // Caso de prueba: x⁴ - 11x³ + 78x² - 14x - 444
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        // Poner grado y generar inputs
        degreeInput.value = '4'
        // Reutilizar el botón generar para crear los inputs de coeficientes
        generateBtn.click()

        // Rellenar coeficientes y calcular tras un pequeño retardo
        setTimeout(() => {
          const inputs = document.querySelectorAll('#coefficients-inputs-bairstow input')
          if (inputs && inputs.length >= 5) {
            inputs[0].value = '1'     // a₀ (x⁴)
            inputs[1].value = '-11'   // a₁ (x³)
            inputs[2].value = '78'    // a₂ (x²)
            inputs[3].value = '-14'   // a₃ (x)
            inputs[4].value = '-444'  // a₄ (término independiente)
            
            // Configurar parámetros iniciales como en la imagen
            document.getElementById('bairstow-r0').value = '1'
            document.getElementById('bairstow-s0').value = '-2'
            document.getElementById('bairstow-tolerance').value = '0.001'
            
            coefficientsContainer.style.display = 'block'
            updatePolynomialPreview()
            // Ejecutar cálculo y graficado
            setTimeout(() => {
              calculateBtn.click()
            }, 200)
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
      const container = document.getElementById('coefficients-inputs-bairstow')
      container.innerHTML = ''

      for (let i = 0; i <= degree; i++) {
        const exp = degree - i
        const div = document.createElement('div')
        div.className = 'coefficient-input'
        
        div.innerHTML = `
          <input type="number" id="coef-bairstow-${i}" step="0.1" placeholder="0" value="${i === 0 ? '1' : '0'}">
          <label for="coef-bairstow-${i}">a<sub>${i}</sub> (x<sup>${exp}</sup>)</label>
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

      document.getElementById('polynomial-preview-bairstow').innerHTML = polynomialStr
    }

    function collectCoefficients() {
      const degree = parseInt(degreeInput.value)
      const coefficients = []

      for (let i = 0; i <= degree; i++) {
        const input = document.getElementById(`coef-bairstow-${i}`)
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

    function calculateBairstow(coefficients, r0, s0, tolerance) {
      iterationsHistory = []
      
      function solveQuadratic(r, s) {
        // roots of x^2 - r x - s = 0
        const disc = r * r + 4 * s
        if (disc >= 0) {
          const sqrt_d = Math.sqrt(disc)
          return [(r + sqrt_d) / 2.0, (r - sqrt_d) / 2.0]
        } else {
          const sqrt_d = Math.sqrt(-disc)
          return [
            { real: r / 2.0, imag: sqrt_d / 2.0 },
            { real: r / 2.0, imag: -sqrt_d / 2.0 }
          ]
        }
      }

      function bairstowOnce(coefs, r, s, eps, maxIter = 100) {
        const n = coefs.length - 1
        if (n < 2) {
          return { r: null, s: null, converged: false, quotient: coefs }
        }

        let currentR = r
        let currentS = s

        for (let iteration = 0; iteration < maxIter; iteration++) {
          // synthetic division to compute b
          const b = new Array(n + 1).fill(0)
          b[0] = coefs[0]
          if (n >= 1) {
            b[1] = coefs[1] + currentR * b[0]
          }
          for (let i = 2; i <= n; i++) {
            b[i] = coefs[i] + currentR * b[i-1] + currentS * b[i-2]
          }

          // compute c (derivative-based)
          const c = new Array(n).fill(0)
          c[0] = b[0]
          if (n >= 2) {
            c[1] = b[1] + currentR * c[0]
          }
          for (let i = 2; i < n; i++) {
            c[i] = b[i] + currentR * c[i-1] + currentS * c[i-2]
          }

          // setup linear system for dr, ds
          const A11 = c[n-2]
          const A12 = c[n-3]
          const A21 = c[n-1]
          const A22 = c[n-2]

          const det = A11 * A22 - A12 * A21

          if (Math.abs(det) < 1e-16) {
            // perturb and retry
            currentR += 1.0
            currentS += 1.0
            continue
          }

          const dr = (-b[n-1] * A22 + b[n] * A12) / det
          const ds = (-b[n] * A22 + b[n-1] * A21) / det

          // Guardar iteración para la tabla
          iterationsHistory.push({
            k: iteration,
            r: currentR,
            s: currentS,
            delta_r: dr,
            delta_s: ds,
            rel_delta_r: Math.abs(dr) / Math.max(1.0, Math.abs(currentR)),
            rel_delta_s: Math.abs(ds) / Math.max(1.0, Math.abs(currentS))
          })

          currentR += dr
          currentS += ds

          // convergence check (relative)
          if (Math.abs(dr) < eps * Math.max(1.0, Math.abs(currentR)) && 
              Math.abs(ds) < eps * Math.max(1.0, Math.abs(currentS))) {
            const quotient = b.slice(0, n-1)
            return { r: currentR, s: currentS, converged: true, quotient: quotient }
          }
        }

        const quotient = b.slice(0, n-1)
        return { r: currentR, s: currentS, converged: false, quotient: quotient }
      }

      function bairstowFactorAll(coefs, r0, s0, eps, maxIter = 1000) {
        const roots = []
        let currentCoefs = [...coefs]
        let message = ""
        let convergedOverall = true
        let finalQuadratic = null

        while (currentCoefs.length - 1 > 2) {
          let r = r0
          let s = s0
          let converged = false
          let quotient = []

          for (let attempt = 0; attempt < 5; attempt++) {
            const result = bairstowOnce(currentCoefs, r, s, eps, 200)
            if (result.converged) {
              converged = true
              r = result.r
              s = result.s
              quotient = result.quotient
              finalQuadratic = { r: r, s: s }
              break
            }
            // perturb initials
            r += 1.0
            s += 1.0
          }

          if (!converged) {
            message = `No convergió Bairstow para polinomio de grado ${currentCoefs.length-1} con los intentos dados`
            return { roots: roots, remainingCoefs: currentCoefs, converged: false, message: message, quadratic: finalQuadratic }
          }

          // obtain quadratic roots
          const [x1, x2] = solveQuadratic(r, s)
          roots.push(x1)
          roots.push(x2)

          // deflate
          currentCoefs = quotient
        }

        // handle remaining polynomial of degree <= 2
        const deg = currentCoefs.length - 1
        if (deg === 2) {
          const [a, b, c] = currentCoefs
          const disc = b * b - 4 * a * c
          if (disc >= 0) {
            const sqrt_d = Math.sqrt(disc)
            roots.push((-b + sqrt_d) / (2 * a))
            roots.push((-b - sqrt_d) / (2 * a))
          } else {
            const sqrt_d = Math.sqrt(-disc)
            roots.push({ real: -b / (2 * a), imag: sqrt_d / (2 * a) })
            roots.push({ real: -b / (2 * a), imag: -sqrt_d / (2 * a) })
          }
        } else if (deg === 1) {
          const [a, b] = currentCoefs
          roots.push(-b / a)
        }

        message = "Convergió"
        return { roots: roots, remainingCoefs: [], converged: true, message: message, quadratic: finalQuadratic }
      }

      // Validación
      if (!coefficients || coefficients.length === 0) {
        throw new Error("Coeficientes no válidos")
      }

      if (coefficients[0] === 0) {
        throw new Error("El coeficiente principal a₀ debe ser diferente de cero")
      }

      return bairstowFactorAll(coefficients, r0, s0, tolerance)
    }

    function displayBairstowResults(results, coefficients) {
      const { roots, converged, message, quadratic } = results

      // Mostrar raíces
      const rootsContainer = document.getElementById('bairstow-roots-result')
      rootsContainer.innerHTML = ''

      let realRoots = 0
      let complexRoots = 0

      roots.forEach((root, index) => {
        const rootDiv = document.createElement('div')
        rootDiv.className = 'bairstow-root-item'
        
        if (typeof root === 'number') {
          rootDiv.classList.add('bairstow-root-real')
          rootDiv.innerHTML = `x<sub>${index + 1}</sub> = ${root.toFixed(6)}`
          realRoots++
        } else if (typeof root === 'object' && root.real !== undefined) {
          rootDiv.classList.add('bairstow-root-complex')
          const sign = root.imag >= 0 ? '+' : ''
          rootDiv.innerHTML = `x<sub>${index + 1}</sub> = ${root.real.toFixed(6)} ${sign} ${Math.abs(root.imag).toFixed(6)}i`
          complexRoots++
        } else if (typeof root === 'number' && isNaN(root)) {
          // Handle NaN case
          rootDiv.innerHTML = `x<sub>${index + 1}</sub> = No definido`
        } else {
          // Handle other cases (shouldn't happen with proper implementation)
          rootDiv.innerHTML = `x<sub>${index + 1}</sub> = ${root}`
        }
        
        rootsContainer.appendChild(rootDiv)
      })

      // Mostrar información de convergencia
      document.getElementById('bairstow-converged-result').textContent = converged ? 'Sí' : 'No'
      document.getElementById('bairstow-message-result').textContent = message
      document.getElementById('bairstow-r-final').textContent = quadratic ? quadratic.r.toFixed(7) : 'N/A'
      document.getElementById('bairstow-s-final').textContent = quadratic ? quadratic.s.toFixed(7) : 'N/A'

      // Información adicional
      document.getElementById('bairstow-degree-result').textContent = coefficients.length - 1
      document.getElementById('bairstow-roots-count').textContent = roots.length
      document.getElementById('bairstow-real-roots').textContent = realRoots
      document.getElementById('bairstow-complex-roots').textContent = complexRoots

      // Mostrar tabla de iteraciones
      displayIterationsTable()

      // Mostrar información del factor cuadrático
      displayQuadraticInfo(quadratic, roots)
    }

    function displayIterationsTable() {
      // Crear o actualizar la tabla de iteraciones
      let tableContainer = document.getElementById('iterations-table-container-bairstow')
      if (!tableContainer) {
        tableContainer = document.createElement('div')
        tableContainer.id = 'iterations-table-container-bairstow'
        tableContainer.className = 'results-box'
        tableContainer.style.marginTop = '20px'
        
        const resultsSection = document.getElementById('results-section-bairstow')
        const additionalInfo = resultsSection.querySelector('.results-box:last-child')
        resultsSection.insertBefore(tableContainer, additionalInfo)
      }

      tableContainer.innerHTML = `
        <h3>TABLA DE ITERACIONES - MÉTODO DE BAIRSTOW</h3>
        <div style="overflow-x: auto;">
          <table id="iterations-table-bairstow" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #2a2a2a;">
                <th style="padding: 10px; border: 1px solid #3a3a3a;">k</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">r</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">s</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">Δr</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">Δs</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">Δr/r</th>
                <th style="padding: 10px; border: 1px solid #3a3a3a;">Δs/s</th>
              </tr>
            </thead>
            <tbody>
              ${iterationsHistory.map(iter => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.k}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.r.toFixed(7)}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.s.toFixed(7)}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.delta_r.toFixed(8)}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.delta_s.toFixed(7)}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.rel_delta_r.toFixed(8)}</td>
                  <td style="padding: 8px; border: 1px solid #3a3a3a; text-align: center;">${iter.rel_delta_s.toFixed(8)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    }

    function displayQuadraticInfo(quadratic, roots) {
      if (!quadratic) return

      const quadraticContainer = document.createElement('div')
      quadraticContainer.className = 'results-box'
      quadraticContainer.style.marginTop = '20px'
      quadraticContainer.style.backgroundColor = '#252525'
      
      quadraticContainer.innerHTML = `
        <h3 style="color: #ffd93d; margin-bottom: 15px;">INFORMACIÓN DEL FACTOR CUADRÁTICO</h3>
        
        <div style="margin-bottom: 15px;">
          <h4 style="color: #e74c3c; margin-bottom: 8px;">Factor Cuadrático Encontrado:</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 16px; color: #6bcf7f; background-color: #1a1a1a; padding: 10px; border-radius: 4px;">
            Q(x) = x² - (${quadratic.r.toFixed(7)})x - (${quadratic.s.toFixed(7)})
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="color: #e74c3c; margin-bottom: 8px;">Fórmula para Raíces:</h4>
          <div style="font-family: 'Courier New', monospace; font-size: 14px; color: #3498db; background-color: #1a1a1a; padding: 10px; border-radius: 4px;">
            x₁,₂ = [r ± √(r² + 4s)] / 2
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <h4 style="color: #e74c3c; margin-bottom: 8px;">Raíces del Factor Cuadrático:</h4>
          ${roots.slice(0, 2).map((root, idx) => {
            if (typeof root === 'number') {
              return `<div style="font-family: 'Courier New', monospace; font-size: 14px; color: #6bcf7f; margin: 5px 0;">
                x<sub>${idx + 1}</sub> = ${root.toFixed(7)}
              </div>`
            } else {
              const sign = root.imag >= 0 ? '+' : ''
              return `<div style="font-family: 'Courier New', monospace; font-size: 14px; color: #3498db; margin: 5px 0;">
                x<sub>${idx + 1}</sub> = ${root.real.toFixed(7)} ${sign} ${Math.abs(root.imag).toFixed(7)}i
              </div>`
            }
          }).join('')}
        </div>

        <div style="background-color: #1a1a1a; padding: 12px; border-radius: 4px; border-left: 4px solid #ffd93d;">
          <p style="color: #b0b0b0; font-size: 14px; margin: 0;">
            <strong>Interpretación:</strong> El método de Bairstow encuentra factores cuadráticos del polinomio original. 
            Cada factor cuadrático Q(x) = x² - rx - s produce dos raíces mediante la fórmula cuadrática.
          </p>
        </div>
      `

      const resultsSection = document.getElementById('results-section-bairstow')
      const iterationsTable = document.getElementById('iterations-table-container-bairstow')
      resultsSection.insertBefore(quadraticContainer, iterationsTable.nextSibling)
    }

    function plotPolynomialWithRoots(coefficients, results) {
      const canvas = document.getElementById('bairstow-chart')
      const ctx = canvas.getContext('2d')

      if (currentChart) {
        currentChart.destroy()
      }

      const { roots } = results

      // Determinar rango de visualización basado en las raíces reales
      let xMin = -10
      let xMax = 10
      const yMin = -500
      const yMax = 500

      // Encontrar raíces reales para ajustar el rango
      const realRoots = roots.filter(root => typeof root === 'number')
      if (realRoots.length > 0) {
        const minRoot = Math.min(...realRoots)
        const maxRoot = Math.max(...realRoots)
        xMin = Math.min(xMin, minRoot - 2)
        xMax = Math.max(xMax, maxRoot + 2)
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

      // Crear datasets para las raíces
      const rootDatasets = []

      // Marcar raíces reales en el gráfico
      roots.forEach((root, index) => {
        if (typeof root === 'number') {
          try {
            const y = currentPolynomial.evaluate({ x: root })
            if (isFinite(y)) {
              rootDatasets.push({
                label: `Raíz ${index + 1}`,
                data: [{ x: root, y: 0 }],
                borderColor: '#e74c3c',
                backgroundColor: '#e74c3c',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false
              })
            }
          } catch (e) {
            // Ignorar raíces problemáticas
          }
        }
      })

      currentChart = new window.Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Polinomio P(x)',
              data: polynomialData,
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              borderWidth: 3,
              pointRadius: 0,
              tension: 0.1,
              fill: false,
            },
            ...rootDatasets
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
                  } else if (context.dataset.label.includes('Raíz')) {
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
                y: { min: -1000, max: 1000 }
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
                stepSize: 100
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
      
      let xMin = typeof xScale.min === 'number' ? xScale.min : -10
      let xMax = typeof xScale.max === 'number' ? xScale.max : 10
      const yMin = typeof yScale.min === 'number' ? yScale.min : -500
      const yMax = typeof yScale.max === 'number' ? yScale.max : 500

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

    console.log('[v0] Módulo Bairstow inicializado')
  }
})()