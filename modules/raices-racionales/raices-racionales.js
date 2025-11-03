// Módulo para listar posibles raíces racionales p/q (p | constant, q | leading coeff)
;(() => {
  const math = window.math

  window.initializeRaicesRacionales = () => {
    console.log('[v0] Inicializando módulo Raíces Racionales...')

    const findBtn = document.getElementById('rr-find-btn')
    const testBtn = document.getElementById('rr-test-btn')
    const polyInput = document.getElementById('rr-polynomial-input')
    const resultBox = document.getElementById('rr-result-box')
    const leadingField = document.getElementById('rr-leading')
    const constantField = document.getElementById('rr-constant')
    const fractionsField = document.getElementById('rr-fractions')

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

      let node
      try {
        node = math.parse(expr)
      } catch (err) {
        alert('Error al parsear la expresión: ' + err.message)
        return
      }

      // Extraer coeficientes usando análisis AST (soporta monomios y sumas simples)
      let coefficients
      try {
        coefficients = getPolynomialCoefficients(node)
      } catch (err) {
        alert('No se pudo extraer coeficientes: ' + err.message)
        return
      }

      if (!coefficients || coefficients.length === 0) {
        alert('No se detectó un polinomio válido')
        return
      }

      const leading = coefficients[coefficients.length - 1]
      const constant = coefficients[0]

      leadingField.textContent = String(leading)
      constantField.textContent = String(constant)

      // divisores de p y q
      const pDivs = getIntegerDivisors(Math.abs(Math.round(constant)))
      const qDivs = getIntegerDivisors(Math.abs(Math.round(leading)))

      if (pDivs.length === 0 || qDivs.length === 0) {
        fractionsField.innerHTML = '<em>Coeficiente principal o término independiente han de ser enteros no cero.</em>'
        resultBox.style.display = 'block'
        return
      }

      // Generar todas las fracciones p/q (NO REDUCIDAS), excluir casos donde p === q (enteros)
      const frSet = new Set()
      pDivs.forEach((p) => {
        qDivs.forEach((q) => {
          // Excluir cualquier fracción p/q que sea entera (p % q === 0)
          if (q !== 0 && p % q === 0) return
          frSet.add(`${p}/${q}`)
        })
      })

      // Convertir set a array de objetos num/den
      const frList = Array.from(frSet).map((s) => {
        const [n, d] = s.split('/').map(Number)
        return { n, d }
      })

      // Sort by absolute value then numerator
      frList.sort((a, b) => Math.abs(a.n / a.d) - Math.abs(b.n / b.d) || a.n / a.d - b.n / b.d)

      // Render
      fractionsField.innerHTML = ''
      const container = document.createElement('div')
      frList.forEach(({ n, d }) => {
        const pos = document.createElement('span')
        pos.className = 'rr-frac'
        pos.textContent = `${n}/${d}`
        container.appendChild(pos)

        const neg = document.createElement('span')
        neg.className = 'rr-frac'
        neg.textContent = `-${n}/${d}`
        container.appendChild(neg)
      })

      fractionsField.appendChild(container)
      resultBox.style.display = 'block'
    })

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        // Ejemplo: 2*x^2 - 3*x - 2 -> leading 2, const -2 => p divisors 1,2 ; q divisors 1,2 => possible ±1,±2,±1/2
        polyInput.value = '2*x^2 - 3*x - 2'
        findBtn.click()
      })
    }

    console.log('[v0] Módulo Raíces Racionales inicializado')
  }

  // --- Helpers ---
  function getIntegerDivisors(n) {
    if (n === 0) return []
    const res = []
    const limit = Math.floor(Math.sqrt(n))
    for (let i = 1; i <= limit; i++) {
      if (n % i === 0) {
        res.push(i)
        const other = n / i
        if (other !== i) res.push(other)
      }
    }
    return res.sort((a, b) => a - b)
  }

  function gcd(a, b) {
    if (b === 0) return a
    return gcd(b, a % b)
  }

  // Extraer coeficientes de un polinomio en orden ascendente (coef[0] = constante)
  function getPolynomialCoefficients(node) {
    // Determinar grado
    const degree = getPolynomialDegree(node)
    const coefficients = new Array(degree + 1).fill(0)

    // Recorrer suma/restas para agregar términos
    function addTerm(n, sign = 1) {
      n = unwrapParenthesis(n)
      // Si es suma o resta
      if (n.type === 'OperatorNode' && (n.op === '+' || n.op === '-')) {
        addTerm(n.args[0], sign)
        if (n.args[1]) addTerm(n.args[1], n.op === '-' ? -sign : sign)
        return
      }

      // Monomio
      const mono = parseMonomial(n)
      if (!mono) throw new Error('Término no es un monomio soportado')
      const { coeff, power } = mono
      coefficients[power] = (coefficients[power] || 0) + sign * coeff
    }

    addTerm(node)
    return coefficients
  }

  function unwrapParenthesis(n) {
    if (!n) return n
    if (n.type === 'ParenthesisNode') return unwrapParenthesis(n.content)
    return n
  }

  function parseMonomial(n) {
    n = unwrapParenthesis(n)
    if (n.type === 'ConstantNode') return { coeff: Number(n.value), power: 0 }
    if (n.type === 'SymbolNode') {
      if (n.name === 'x') return { coeff: 1, power: 1 }
      return null
    }
    if (n.type === 'OperatorNode' && n.fn === 'unaryMinus') {
      const inner = parseMonomial(n.args[0])
      if (!inner) return null
      return { coeff: -inner.coeff, power: inner.power }
    }

    if (n.type === 'OperatorNode' && n.op === '^') {
      const base = unwrapParenthesis(n.args[0])
      const exp = unwrapParenthesis(n.args[1])
      if (base.type === 'SymbolNode' && base.name === 'x' && exp.type === 'ConstantNode') {
        const p = Number(exp.value)
        if (!Number.isInteger(p) || p < 0) return null
        return { coeff: 1, power: p }
      }
      return null
    }

    if (n.type === 'OperatorNode' && n.op === '*') {
      // multiplicación de factores: determinar coeficiente y potencia
      let coeff = 1
      let power = 0
      for (const arg of n.args) {
        const a = unwrapParenthesis(arg)
        if (a.type === 'ConstantNode') {
          coeff *= Number(a.value)
        } else if (a.type === 'SymbolNode' && a.name === 'x') {
          power += 1
        } else if (a.type === 'OperatorNode' && a.op === '^') {
          const base = unwrapParenthesis(a.args[0])
          const exp = unwrapParenthesis(a.args[1])
          if (base.type === 'SymbolNode' && base.name === 'x' && exp.type === 'ConstantNode') {
            const p = Number(exp.value)
            if (!Number.isInteger(p) || p < 0) return null
            power += p
          } else {
            return null
          }
        } else if (a.type === 'ParenthesisNode') {
          const inner = parseMonomial(a.content)
          if (!inner) return null
          coeff *= inner.coeff
          power += inner.power
        } else {
          return null
        }
      }
      return { coeff, power }
    }

    return null
  }

  function getPolynomialDegree(node) {
    node = unwrapParenthesis(node)
    if (!node) return 0
    if (node.type === 'ConstantNode') return 0
    if (node.type === 'SymbolNode' && node.name === 'x') return 1
    if (node.type === 'OperatorNode' && node.op === '^') {
      const base = unwrapParenthesis(node.args[0])
      const exp = unwrapParenthesis(node.args[1])
      if (base.type === 'SymbolNode' && base.name === 'x' && exp.type === 'ConstantNode') {
        return Number(exp.value)
      }
    }
    if (node.type === 'OperatorNode' && node.op === '*') {
      // sum exponents of factors
      let deg = 0
      for (const arg of node.args) {
        deg += getPolynomialDegree(arg)
      }
      return deg
    }
    if (node.type === 'OperatorNode' && (node.op === '+' || node.op === '-')) {
      return Math.max(getPolynomialDegree(node.args[0]), getPolynomialDegree(node.args[1]))
    }
    if (node.type === 'ParenthesisNode') return getPolynomialDegree(node.content)
    if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') return getPolynomialDegree(node.args[0])
    return 0
  }

})()
