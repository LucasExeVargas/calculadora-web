// Módulo para listar posibles raíces enteras: divisores del término independiente
;(() => {
  const math = window.math

  window.initializeRaicesEnteras = () => {
    console.log('[v0] Inicializando módulo Raíces Enteras...')

    const findBtn = document.getElementById('re-find-btn')
    const testBtn = document.getElementById('re-test-btn')
    const polyInput = document.getElementById('re-polynomial-input')
    const resultBox = document.getElementById('re-result-box')
    const constantField = document.getElementById('re-constant')
    const divisorsField = document.getElementById('re-divisors')

    if (!findBtn || !polyInput) {
      console.error('[v0] Elementos necesarios no encontrados')
      return
    }

    polyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') findBtn.click()
    })

    findBtn.addEventListener('click', () => {
      const expr = polyInput.value.trim()
      if (!expr) {
        alert('Introduce el polinomio')
        return
      }

      if (typeof math === 'undefined') {
        alert('math.js no está cargado')
        return
      }

      let compiled
      try {
        compiled = math.compile(expr)
      } catch (err) {
        alert('Error al parsear la expresión: ' + err.message)
        return
      }

      // Obtener término independiente evaluando en x = 0
      let constant
      try {
        const val = compiled.evaluate({ x: 0 })
        constant = Number(val)
      } catch (err) {
        alert('Error evaluando la expresión en x=0: ' + err.message)
        return
      }

      if (!Number.isFinite(constant)) {
        alert('No se pudo determinar el término independiente')
        return
      }

      // Mostrar constante
      constantField.textContent = String(constant)

      // Si la constante no es entero, informar
      const tol = 1e-9
      const rounded = Math.round(constant)
      if (Math.abs(constant - rounded) > tol) {
        divisorsField.innerHTML = '<em>El término independiente no es entero; no hay divisores enteros definidos.</em>'
        resultBox.style.display = 'block'
        return
      }

      const cInt = rounded
      if (cInt === 0) {
        divisorsField.innerHTML = '<em>El término independiente es 0. 0 es raíz (multiplicidad posible). Considera factorizar o dividir por x.</em>'
        resultBox.style.display = 'block'
        return
      }

      const divisors = getIntegerDivisors(Math.abs(cInt)).sort((a,b)=>Math.abs(a)-Math.abs(b)||a-b)

      // Mostrar como etiquetas + incluir signo negativo
      divisorsField.innerHTML = ''
      const container = document.createElement('div')
      divisors.forEach((d) => {
        const spanPos = document.createElement('span')
        spanPos.className = 'div-item'
        spanPos.textContent = String(d)
        container.appendChild(spanPos)

        const spanNeg = document.createElement('span')
        spanNeg.className = 'div-item'
        spanNeg.textContent = String(-d)
        container.appendChild(spanNeg)
      })

      divisorsField.appendChild(container)
      resultBox.style.display = 'block'
    })

    // Caso de prueba
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        polyInput.value = 'x^3 - 6*x^2 + 11*x - 6' // raíces reales enteras 1,2,3 -> término independiente -6
        findBtn.click()
      })
    }

    console.log('[v0] Módulo Raíces Enteras inicializado')
  }

  // --- helpers ---
  function getIntegerDivisors(n) {
    const res = []
    const limit = Math.floor(Math.sqrt(n))
    for (let i = 1; i <= limit; i++) {
      if (n % i === 0) {
        res.push(i)
        const other = n / i
        if (other !== i) res.push(other)
      }
    }
    return res
  }

})()
