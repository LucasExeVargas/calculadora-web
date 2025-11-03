// Módulo para evaluar polinomios en un punto. Usa math.js
;(() => {
  const math = window.math

  window.initializePolinomio = () => {
    console.log('[v0] Inicializando módulo Polinomio...')

    const evalBtn = document.getElementById('eval-btn')
    const testBtn = document.getElementById('test-btn-polinomio')
    const polyInput = document.getElementById('polynomial-input')
    const xInput = document.getElementById('polynomial-x')
    const resultBox = document.getElementById('result-box')
    const resultField = document.getElementById('polynomial-result')

    if (!evalBtn || !polyInput || !xInput) {
      console.error('[v0] Elementos necesarios no encontrados')
      return
    }

    polyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') evalBtn.click()
    })

    evalBtn.addEventListener('click', () => {
      const expr = polyInput.value.trim()
      const xVal = Number.parseFloat(xInput.value)

      if (!expr) {
        alert('Introduce el polinomio')
        return
      }

      if (isNaN(xVal)) {
        alert('Introduce un valor numérico para x')
        return
      }

      try {
        if (typeof math === 'undefined') {
          alert('math.js no está cargado')
          return
        }

        // Validar que la expresión sea un polinomio en x
        let node
        try {
          node = math.parse(expr)
        } catch (parseErr) {
          alert('Error al parsear la expresión: ' + parseErr.message)
          return
        }

        const isValid = isPolynomialNode(node)
        if (!isValid) {
          alert('La expresión debe ser un polinomio en la variable x (solo sumas, productos, potencias enteras no negativas y constantes).')
          return
        }

        const compiled = math.compile(expr)
        const value = compiled.evaluate({ x: xVal })

        resultField.textContent = String(value)
        resultBox.style.display = 'block'
      } catch (err) {
        alert('Error evaluando el polinomio: ' + err.message)
      }
    })

    // --- Helpers para validación ---
    // Determina si un nodo AST de math.js representa un polinomio en x
    function isPolynomialNode(node) {
      if (!node) return false

      // Un polinomio es suma/resta de monomios o un monomio/constante
      if (node.type === 'OperatorNode' && (node.op === '+' || node.op === '-')) {
        return isPolynomialNode(node.args[0]) && isPolynomialNode(node.args[1])
      }

      // Parenthesis: validar contenido
      if (node.type === 'ParenthesisNode') {
        return isPolynomialNode(node.content)
      }

      // Constant
      if (node.type === 'ConstantNode') return true

      // Symbol: only x allowed
      if (node.type === 'SymbolNode') {
        return node.name === 'x'
      }

      // Unaries (e.g., -x)
      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        return isPolynomialNode(node.args[0])
      }

      // Multiplication: product of monomials/constant
      if (node.type === 'OperatorNode' && node.op === '*') {
        // Allow multiple factors: ensure none are sums
        return node.args.every((arg) => isMonomialNode(arg))
      }

      // Power: x^n where n is non-negative integer, or (monomial)^1 etc.
      if (node.type === 'OperatorNode' && node.op === '^') {
        const base = node.args[0]
        const exp = node.args[1]
        // base must be symbol x or a monomial without sums
        if (base.type === 'SymbolNode' && base.name === 'x') {
          if (exp.type === 'ConstantNode') {
            const val = Number(exp.value)
            return Number.isInteger(val) && val >= 0
          }
          return false
        }
        // Could allow (c*x)^n where base is multiplication of constant and x
        if (isMonomialNode(base) && exp.type === 'ConstantNode') {
          const val = Number(exp.value)
          return Number.isInteger(val) && val >= 0
        }
        return false
      }

      // If it's a monomial (constant, x, x^n, constant*x^n, product of such)
      if (isMonomialNode(node)) return true

      // Reject FunctionNode or others (sin, cos, exp, etc.)
      return false
    }

    // Determina si el nodo representa un monomio (producto de constante y potencias de x)
    function isMonomialNode(node) {
      if (!node) return false

      if (node.type === 'ConstantNode') return true
      if (node.type === 'SymbolNode') return node.name === 'x'
      if (node.type === 'ParenthesisNode') return isMonomialNode(node.content)

      // Power handled: x^n
      if (node.type === 'OperatorNode' && node.op === '^') {
        const base = node.args[0]
        const exp = node.args[1]
        if (base.type === 'SymbolNode' && base.name === 'x' && exp.type === 'ConstantNode') {
          const val = Number(exp.value)
          return Number.isInteger(val) && val >= 0
        }
        return false
      }

      // Multiplication: all factors must be constant or powers of x
      if (node.type === 'OperatorNode' && node.op === '*') {
        return node.args.every((arg) => {
          // allow constant or power x^n or x
          if (arg.type === 'ConstantNode') return true
          if (arg.type === 'SymbolNode') return arg.name === 'x'
          if (arg.type === 'ParenthesisNode') return isMonomialNode(arg.content)
          if (arg.type === 'OperatorNode' && arg.op === '^') return isMonomialNode(arg)
          return false
        })
      }

      // Unary minus applied to monomial
      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        return isMonomialNode(node.args[0])
      }

      return false
    }

    // Caso de prueba: polinomio y valor de ejemplo
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        polyInput.value = '2*x^3 + 3*x - 5'
        xInput.value = '1.5'
        evalBtn.click()
      })
    }

    console.log('[v0] Módulo Polinomio inicializado')
  }
})()
